'use strict';

var React = require('react-native');
var {
    StyleSheet,
    View,
    Navigator,
    Text,
    Image,
} = React;
var POST = app.POST;
var Subscribable = require('Subscribable');
var TimerMixin = require('react-timer-mixin');
var Toast = require('@remobile/react-native-toast').show;
var ProgressHUD = require('react-native-progress-hud');
var TrainMain = require('./TrainMain.js');
var Phone = require('../../native/index.js').Phone;
var broadcast = {"broadcastType":4,"chatroomArray":[{"channelState":1,"seatNumber":2,"userID":"2ygut4se"},{"channelState":1,"seatNumber":1,"userID":"liugang-222"}],"isReStart":0,"stateCount":2}
var Progress = require('react-native-progress');

module.exports = React.createClass({
    mixins: [Subscribable.Mixin, TimerMixin],
    componentWillMount() {
        this.addListenerOn(app.audioManager, 'onconnect', (param)=>{
            this.onconnect(param);
        });
        this.addListenerOn(app.audioManager, 'ondisconnect', (param)=>{
            this.ondisconnect(param);
        });
        this.addListenerOn(app.audioManager, 'onmatchingroom', (param)=>{
            this.onmatchingroom(param);
        });
        this.addListenerOn(app.audioManager, 'onbroadcast', (param)=>{
            this.onbroadcast(param);
        });
    },
    getUserIdArray(data) {
        var userIdArray=[];
        for (var item in data) {
            userIdArray.push(data[item].userID);
        }
        console.log("getuserIdArray",userIdArray);
        return userIdArray;
    },
    componentDidMount() {
        if (typeof(app.audioManager.connectState) == "undefined" || !app.audioManager.connectState) {//没连接上重新连接服务器
            app.audioManager.connectAudioServer();
        } else {
            app.audioManager.matchingChatroom(this.props.gameType);
        }
        var timeoutID = setInterval(()=>{
            var progress = this.state.progress + 0.005;
            this.timeoutID = timeoutID;
            if (progress >= 1) {
                clearInterval(timeoutID);
                app.navigator.pop();
            } else {
                this.setState({progress});
            }
        }, 100);
    },
    getInitialState() {
        return {
            isSpeakerAngle:false,
            progress: 0,
        };
    },
    onconnect(result) {
        console.log('onconnect', result);
        if (result) {
            app.audioManager.connectState = true;
            app.audioManager.matchingChatroom(this.props.gameType);
        }
    },
    ondisconnect(result) {
        console.log('ondisconnect', result);
        if (result) {
            app.audioManager.connectState = false;
            app.navigator.pop();
        }
    },
    onmatchingroom(result) {
        console.log('onmatchingroom waitView', result);
        this.chatroomID = result.chatroomID;
        if (result.result === 0) {
            app.audioManager.joinChatroom();
        }
    },
    onbroadcast(result) {
        if (result.broadcastType === 4) {//游戏准备好可以开始演讲
            console.log('onbroadcast', result);
            this.setState({isSpeakerAngle:app.audioManager.isSpeaker()});
            this.getCompetitorsInfo();
        }
    },
    getCompetitorsInfo() {
        var param = {
            competitorsInfo:this.getUserIdArray(app.audioManager.chatroomArray),
        };
        POST(app.route.ROUTE_GET_COMPETITORS_INFO, param, this.getCompetitorsInfoSuccess);
    },
    getCompetitorsInfoSuccess(data) {
        if (data.success) {
            console.log("app.audioManager.chatroomArray",app.audioManager.chatroomArray);
            console.log("data.context.userInfoList",data.context.userInfoList);
            app.audioManager.setRankArray(data.context.userInfoList);
            app.audioManager.setSpeechStateArray(data.context.userInfoList);
            var route = {
                title: '训练场',
                component: TrainMain,
                leftButton: {handler: ()=>{TrainMain.goBack()} },
                passProps: {isSpeakerAngle:this.state.isSpeakerAngle,context:data.context}
            };
            app.navigator.replace(route);
            if (this.timeoutID != null) {
                this.clearInterval(this.timeoutID);
                this.timeoutID = null;
            }
        } else {
            Toast(data.msg);
        }
    },
    render() {
        return (
            <View style={styles.container}>
                <Image
                    resizeMode='stretch'
                    source={app.img.train_ready_background}
                    style={styles.backgroundImage}>
                    <View style={styles.waitView}>
                      <Progress.Circle
                          progress={this.state.progress}
                          size={80}
                          unfilledColor='#dbf3ff'
                          borderWidth={0.5}
                          borderColor="black"
                          thickness={10}
                          direction="clockwise"
                          textStyle={{color:'white', fontSize: 40, fontWeight:'100', alignSelf:'center'}}
                          showsText={true}
                          formatText={(p)=>{
                              p = Math.floor(p*20);
                              return 20-p;
                          }}
                          color='#249fdb' />
                    </View>
                    <Text style={styles.title}>正在匹配选手...</Text>
                    {
                        this.props.sex===0?
                        <Image
                            resizeMode='stretch'
                            source={app.img.train_girl}
                            style={styles.icon} />
                        :
                        <Image
                            resizeMode='stretch'
                            source={app.img.train_boy}
                            style={styles.icon} />
                    }

                </Image>
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
    backgroundImage: {
        width:sr.w,
        height:sr.w*1334/750,
        marginTop:-120,
        alignItems:'center',
        justifyContent:'center',
    },
    waitView: {
        marginTop:25,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    icon: {
        width:sr.w/3,
        height:(sr.w/3)*522/184,
    },
    title: {
        marginVertical:10,
        color: 'white',
        fontSize: 16,
        overflow: 'hidden',
    },
});
