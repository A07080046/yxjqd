'use strict';

var React = require('react-native');
var {
    StyleSheet,
    View,
    Navigator,
    Text,
    Image,
} = React;
var Button = app.components.Button;
var Slider = app.components.Slider;
var TimerMixin = require('react-timer-mixin');
module.exports = React.createClass({
    mixins: [TimerMixin],
    getInitialState() {
        var list = _.cloneDeep(this.props.userInfoList);
        list.splice(this.props.speakerIndex,1)
        return {
            HearerList: list,
        };
    },
    doStartSpeach() {
        app.audioManager.startSpeak();
    },
    doStopSpeach() {
        app.audioManager.stopSpeak();
    },
    render() {
        return (
            <View style={styles.container}>
                <Image
                    resizeMode='stretch'
                    source={app.img.train_backgroundlight}
                    style={styles.backgroundlightImage}>
                    <View style={styles.imageContainer}>
                        {
                            this.state.HearerList.map((item, i)=>{
                                return (
                                    item.sex===0?
                                    <Image
                                        resizeMode='stretch'
                                        source={app.img.train_girl_sit}
                                        style={styles.icon}>
                                    </Image>
                                    :
                                    <Image
                                        resizeMode='stretch'
                                        source={app.img.train_boy_sit}
                                        style={styles.icon}>
                                    </Image>
                                )
                            })
                        }
                    </View>
                    <Image
                        resizeMode='stretch'
                        source={app.img.train_table}
                        style={styles.tableIcon}>
                    </Image>
                    <Image
                        resizeMode='stretch'
                        source={app.img.train_microphone}
                        style={styles.microphoneIcon} />
                    {
                        this.props.showStartBtn && <Button
                        onPress={this.doStartSpeach}
                        style={styles.trainStartNowButton}>立即开始</Button>
                    }
                    {
                        this.props.showStopBtn && <Button
                        onPress={this.doStopSpeach}
                        style={styles.trainStopNowButton}>结束演讲</Button>
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
    backgroundlightImage: {
        width:sr.w,
        height:sr.w*1334/750,
        alignItems:'center',
        justifyContent:'center',
    },
    imageContainer: {
        height:sr.h/5,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
    },
    icon: {
        width:sr.w/5,
        height:sr.h/5,
    },
    tableIcon: {
        width:sr.w*8/9,
        height:(sr.w*8/9)*276/784,
        marginTop:-50,
    },
    microphoneIcon: {
        width:sr.w*1/5,
        height:(sr.w*1/5)*570/264,
        marginTop:-50,
    },
    trainStartNowButton: {
        position:'absolute',
        width:80,
        height:80,
        left:(sr.w-80)/2,
        top:sr.h/2-50,
        borderRadius:40,
        borderColor:'gray',
        borderWidth:3,
    },
    trainStopNowButton: {
        position:'absolute',
        width:100,
        height:40,
        left:sr.w-120,
        top:sr.h/2+50,
        borderRadius:20,
        borderColor:'red',
    },
});
