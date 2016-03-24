'use strict';

var React = require('react-native');
var {
    StyleSheet,
    View,
    Navigator,
    Text,
    Image,
} = React;
var ProgressHUD = require('react-native-progress-hud');
var TrainSpeakerAngleView = require('./TrainSpeakerAngleView.js');
var TrainHearerAngleView = require('./TrainHearerAngleView.js');
var TrainProp= require('./Prop.js');
var TrainPChat= require('./Chat.js');
var SpeechState = require('./SpeechState.js');
var TrainPropGifMessageBox = require('../../components/MessageBox/TrainPropGifMessageBox.js');

var POST = app.POST;
var Toast = require('@remobile/react-native-toast').show;
var Subscribable = require('Subscribable');
var TrainGradeMessageBox = require('../../components/MessageBox/TrainGradeMessageBox.js');
var TrainRankMessageBox = require('../../components/MessageBox/TrainRankMessageBox.js');
var Progress = require('react-native-progress');
module.exports = React.createClass({
    mixins: [Subscribable.Mixin],
    componentWillMount() {
        module.exports.goBack = this.goBack;
        this.addListenerOn(app.audioManager, 'onsetgrade', (param)=>{
            this.onsetgrade(param);
        });
        this.addListenerOn(app.audioManager, 'onbroadcast', (param)=>{
            this.onbroadcast(param);
        });
        this.addListenerOn(app.audioManager, 'onSendMessage', (param)=>{
            this.onSendMessage(param);
        });
        this.addListenerOn(app.audioManager, 'onexitroom', (param)=>{
            this.onexitroom(param);
        });
        this.addListenerOn(app.audioManager, 'ondisconnect', (param)=>{
            this.ondisconnect(param);
        });
    },
    goBack() {
        app.audioManager.exitChatroom();
    },
    doRestart() {
        this.setState({overlayShowRank:false,showSpeakerStartBtn:true});
        app.audioManager.restart();
    },
    doExit() {
        this.setState({overlayShowRank:false});
        this.goBack();
    },
    doConfirm(score) {//关闭和确定都打分
        this.setState({overlayShowGrade:false});
        app.audioManager.setGradeToServer(score);
    },
    onsetgrade(result) {
        //下一轮演讲或者弹出排名逻辑
    },
    onSendMessage(result) {
        //下一轮演讲或者弹出排名逻辑
    },
    ondisconnect(result) {
        console.log('ondisconnect', result);
        if (result) {
            app.audioManager.connectState = false;
            app.navigator.pop();
        }
    },
    onexitroom(result) {
        if (app.personal.info.userID == result.userID) {
            app.navigator.pop();
        }
    },
    getScoreList() {
        var array = [];
        app.audioManager.RankArray.sort(function(a,b){
           return b.score-a.score;
        });
        for (var item in app.audioManager.RankArray) {
            var arrayItem = {};
            if (item == 0) {
                arrayItem.rank = 1;
                app.audioManager.RankArray[item].rank = 1;
            } else {
                arrayItem.rank = app.audioManager.RankArray[item].score<app.audioManager.RankArray[item-1].score?app.audioManager.RankArray[item-1].rank+1:app.audioManager.RankArray[item-1].rank;
                app.audioManager.RankArray[item].rank = arrayItem.rank;
            }
            arrayItem.userID = app.audioManager.RankArray[item].userID;
            arrayItem.score = app.audioManager.RankArray[item].score;
            array.push(arrayItem);
        }
        return array;
    },
    doSubmitScore() {
        var param = {
            roomID:app.audioManager.chatroomID,
            trainingID:app.audioManager.trainingID,
            scoreList:{
                scoreList:this.getScoreList()
            }
        };
        POST(app.route.ROUTE_SUBMIT_SCORE, param, this.doSubmitScoreSuccess);
    },
    doSubmitScoreSuccess(data) {
            Toast(data.msg);
    },
    onbroadcast(result) {
        console.log('onmatchingroom mainView', result);
        //刷新界面
        switch (result.broadcastType) {
            case 1://参与者状态发生改变，同时更新界面头像状态
                app.audioManager.setSpeechState();
                break;
            case 2://开始演讲,刷新界面状态，去掉演讲者视角准备按钮，去掉听者转圈
                if (this.state.isSpeakerAngle) {
                    this.setState({showSpeakerStartBtn:false});
                    setTimeout(()=>{
                        this.setState({showSpeakerStopBtn:true});
                    }, 10000);
                } else {
                    this.setState({showWaitView:false});
                }
                break;
            case 3://演讲结束，打分弹框
                console.log('onbroadcast3 isSpeakerAngle', this.state.isSpeakerAngle);
                if (!this.state.isSpeakerAngle) {
                    this.setState({overlayShowGrade:true});
                } else {
                    this.setState({showSpeakerStopBtn:false});
                }
                break;
            case 4://游戏准备OK,可以加入开始演讲
                console.log('isSpeakerAngle before', this.state.isSpeakerAngle);
                this.setState({isSpeakerAngle:app.audioManager.isSpeaker()});
                console.log('isSpeakerAngle after', this.state.isSpeakerAngle);
                break;
            case 5://游戏结束,弹出本轮打分排名
                this.setState({overlayShowRank:true});
                this.doSubmitScore();
                break;
            case 6://游戏的打分,自己打完分停止10s的打分转圈，被打分者更新头像加分效果
                this.setRankArrayScore(result);

                break;
            case 7://退出房间,只剩一个人，返回入口界面
                this.goBack();
                break;
            case 8://所有人打分完成，更新界面
                console.log('isSpeakerAngle before', this.state.isSpeakerAngle);
                this.setState({isSpeakerAngle:app.audioManager.isSpeaker()});
                console.log('isSpeakerAngle after', this.state.isSpeakerAngle);
                break;
            default:
        }
    },
    setRankArrayScore(data) {
        console.log("setRankArrayScoreBefore",app.audioManager.RankArray);
        for (var item in app.audioManager.RankArray) {
            if(app.audioManager.RankArray[item].userID === data.gradeUserID) {
                app.audioManager.RankArray[item].score = data.gradeCount;
            }
        }
        console.log("setRankArrayScoreAfter",app.audioManager.RankArray);
    },
    getInitialState() {
        return {
            overlayShow:false,
            overlayShowGrade:false,
            overlayShowRank:false,
            showSpeakerStartBtn:true,
            showSpeakerStopBtn:false,
            showWaitView:true,
            isSpeakerAngle:this.props.isSpeakerAngle,
            speechState: 1,
            context:this.props.context,
            timeOut: 5,
            progress: 0,
        };
    },
    showGif(propCode) {
      this.setState({overlayShow: true, propCode: propCode});
      var timeID = setInterval(()=>{
          var timeOut = this.state.timeOut-1;
          if (timeOut <= 0) {
              this.setState({overlayShow: false, propCode: propCode});
              clearInterval(timeID);
          }
          this.setState({timeOut});
        }, 1000);
    },
    componentDidMount() {
      var timeID = setInterval(()=>{
          var progress = this.state.progress + 0.01;
          if (progress >= 1) {
              clearInterval(timeID);
          }
          this.setState({progress});
      }, 100);
    },
    render() {
        var time = 10-Math.floor(this.state.progress*10);
        return (
            <View style={styles.container}>
                {
                    this.state.isSpeakerAngle?
                    <TrainSpeakerAngleView userInfoList={this.state.context.userInfoList} doStartNow={this.props.startSpeak} speakerIndex={1} showStartBtn={this.state.showSpeakerStartBtn} showStopBtn={this.state.showSpeakerStopBtn}/>
                    :<TrainHearerAngleView userInfoList={this.state.context.userInfoList} speakerIndex={1} showWaitView={this.state.showWaitView}/>
                }
                {
                    this.state.isSpeakerAngle?<TrainPChat roomID={app.audioManager.chatroomID} noticeShow={this.showGif} style={styles.chatBottomView}/>:
                    <View style={styles.propBottomView}>
                        <TrainProp roomID={app.audioManager.chatroomID} propList={this.state.context.propList}/>
                        <TrainPChat roomID={app.audioManager.chatroomID} noticeShow={this.showGif}/>
                    </View>
                }
                <View style={styles.propTopView}>
                    <SpeechState
                        data={app.audioManager.SpeechStateArray}
                        speechState={this.state.speechState}
                      />
                </View>
                {
                    this.state.overlayShow &&
                    <TrainPropGifMessageBox propCode={this.state.propCode}/>
                }
                {
                    this.state.overlayShowGrade &&
                    <TrainGradeMessageBox doConfirm={this.doConfirm}></TrainGradeMessageBox>
                }
                {
                    this.state.overlayShowRank &&
                    <TrainRankMessageBox doRestart={this.doRestart} doExit={this.doExit}></TrainRankMessageBox>
                }
                <View style={this.state.isSpeakerAngle?styles.trainProgressBarSpeaker:styles.trainProgressBarHearer}>
                  <Text>{'时间剩余:'+time+'秒'}</Text>
                  <Progress.Bar
                      progress={this.state.progress}
                      width={sr.w-100}
                      height={10}
                      borderRadius={6}
                      animated={true}
                      borderWidth={1}
                      borderColor='white'
                      color='#ff3c30'/>
                </View>
            </View>
        )
    }
});

var sr = app.Screen;
var styles = StyleSheet.create({
    container: {
        width:sr.w,
        height:sr.h,
        alignItems:'center',
        justifyContent:'center',
    },
    propBottomView: {
        position:'absolute',
        bottom:0,
        width:sr.w,
        height:260,
    },
    chatBottomView: {
        position:'absolute',
        bottom:0,
        width:sr.w,
        height:180,
    },
    propTopView: {
      position:'absolute',
      top: 0,
      left: 0,
      width: sr.w - 60,
    },
    trainProgressBarSpeaker: {
        position:'absolute',
        width:sr.w-100,
        height:10,
        bottom:200,
        left:50,
        alignItems:'center',
        justifyContent:'center',
    },
    trainProgressBarHearer: {
        position:'absolute',
        width:sr.w-100,
        height:10,
        bottom:270,
        left:50,
        alignItems:'center',
        justifyContent:'center',
    },
});
