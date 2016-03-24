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
var ProgressHUD = require('react-native-progress-hud');
module.exports = React.createClass({
    getInitialState() {
        var list = _.cloneDeep(this.props.userInfoList);
        return {
            showWaitView: true,
            SpeakerList: list.splice(this.props.speakerIndex,1),
            HearerList: list
        };
    },
    render() {
        return (
            <View style={styles.container}>
                <Image
                    resizeMode='stretch'
                    source={app.img.train_backgroundlight}
                    style={styles.backgroundlightImage}>
                    {
                        this.state.SpeakerList.map((item, i)=>{
                            return (
                                item.sex===0?
                                <Image
                                    resizeMode='stretch'
                                    source={app.img.train_girl}
                                    style={styles.speakerIcon} />
                                :
                                <Image
                                    resizeMode='stretch'
                                    source={app.img.train_boy}
                                    style={styles.speakerIcon} />
                            )
                        })
                    }
                    <Image
                        resizeMode='stretch'
                        source={app.img.train_start_microphone}
                        style={styles.microphoneIcon} />
                    <Image
                        resizeMode='stretch'
                        source={app.img.train_desktop}
                        style={styles.tableIcon} />
                    <View style={styles.hearerIconContainer}>
                        {
                            this.state.HearerList.map((item, i)=>{
                                return (
                                    item.sex===0?
                                    <Image
                                        resizeMode='stretch'
                                        source={app.img.train_girl_back}
                                        style={styles.hearerIcon}>
                                        <Text style={{color:'white',marginTop:20}}>
                                            {item.userName}
                                        </Text>
                                    </Image>
                                    :
                                    <Image
                                        resizeMode='stretch'
                                        source={app.img.train_boy_back}
                                        style={styles.hearerIcon}>
                                        <Text style={{color:'white',marginTop:20}}>
                                            {item.userName}
                                        </Text>
                                    </Image>
                                )
                            })
                        }
                    </View>
                    {
                        this.state.showWaitView &&
                        <View>
                            <View style={styles.waitView}>
                                <ProgressHUD
                                    style={styles.waitView}
                                  isVisible={true}
                                  isDismissible={false}
                                />
                            </View>
                            <Text style={styles.title}>准备开始</Text>
                        </View>
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
    speakerIcon: {
        width:sr.w/6,
        height:(sr.w/6)*515/176,
        marginTop:-195,
    },
    tableIcon: {
        position:'absolute',
        marginTop:40,
        width:sr.w,
        height:(sr.w)*149/750,
    },
    microphoneIcon: {
        width:sr.w*1/14,
        height:(sr.w*1/14)*220/45,
        marginTop:-130,
    },
    hearerIconContainer: {
        position:'absolute',
        height:sr.h/5,
        flexDirection:'row',
    },
    hearerIcon: {
        width:sr.w/4,
        height:(sr.w/4)*224/198,
        marginHorizontal:20,
        marginTop:20,
        alignItems:'center',
    },
    waitView: {
        position:'absolute',
        left:(sr.w-100)/2,
        top:200,
        backgroundColor: 'transparent',
    },
    title: {
        position:'absolute',
        left:(sr.w-100)/2,
        width:100,
        top:300,
        color: 'white',
        fontSize: 16,
        textAlign:'center',
        overflow: 'hidden',
    },
});
