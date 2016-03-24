'use strict';

var React = require('react-native');
var Des = require('@remobile/react-native-des');
var Toast = require('@remobile/react-native-toast').show;

var {
    Image,
    StyleSheet,
    ListView,
    Text,
    Button,
    View,
    TouchableOpacity,
} = React;

var sr = app.Screen;
var POST = app.POST;
var Button = app.components.Button;
var TrainMain = require('./TrainMain.js');

module.exports = React.createClass({
    getInitialState() {
        return {
            info: app.personal.info,
            propList: this.props.propList,
        };
    },
    _onPressRow(propInfo) {
        if (app.audioManager.gradeUserID == '0') {
            Toast('游戏还未开始,暂不能发送道具');
            return;
        }
        var personInfo = app.personal.info;
        //0表示用积分购买1-用赢销币购买 发送成功后 减去相应的积分和营销币
        if (propInfo.propType == 1) {
            if (personInfo.integral < propInfo.propValue) {
                Toast('积分不足');
                return;
            }
        } else if (propInfo.propType == 2) {
            if (personInfo.winCoin < propInfo.propValue) {
                Toast('营销币不足');
                return;
            }
        }
        var param = {
            fromUserID: this.state.info.userID,
            toUserID: app.audioManager.gradeUserID,
            propID: propInfo.propID,
            roomID: this.props.roomID,
        };
        POST(app.route.ROUTE_SEND_PROP, param, this.doSendPropSuccess.bind(null, propInfo));
    },
    doSendPropSuccess(propInfo, data) {
        if (data.success) {
            var personInfo = app.personal.info;
            //0表示用积分购买1-用赢销币购买 发送成功后 减去相应的积分和营销币
            if (propInfo.propType == 1) {
                personInfo.integral -= propInfo.propValue;
                Toast('您消耗了'+propInfo.propValue+'积分');
            } else if (propInfo.propType == 2) {
                personInfo.winCoin -= propInfo.propValue;
                Toast('您消耗了'+propInfo.propValue+'赢销币');
            }
            var winNum = parseInt(personInfo.winCoin);
            var integralNum = parseInt(personInfo.integral);
            if (winNum <= 0) {
                personInfo.winCoin = 0;
            }
            if (integralNum <= 0) {
                personInfo.integral = 0;
            }
            //更新个人积分信息
            app.personal.set(personInfo);
            this.setState(this.state.info);
        } else {
            Toast(data.msg);
        }
    },
    render() {
        return (
            <View style={[styles.container, this.props.style]}>
                <View style={styles.panelContainer}>
                    {
                        this.state.propList.map((item, i)=>{
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.propComtainer}
                                    onPress={this._onPressRow.bind(null, item)}>
                                    <Image
                                        style={styles.chatImage}
                                        resizeMode='contain'
                                        defaultSource={app.img.common_default}
                                        source={{uri:item.propImg}}>
                                    </Image>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
                <View style={styles.currencyContainer}>
                    <Text style={styles.currencyText}>{'营销积分:' + this.state.info.integral}</Text>
                    <Text style={styles.currencyText}>{'营销币:' + this.state.info.winCoin}</Text>
                </View>
                <View style={styles.separator}/>
            </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    panelContainer: {
        marginTop: 5,
        marginLeft: 3,
        marginRight: 8,
        alignSelf: 'flex-start',
        width:sr.w-11,
        flexDirection: 'row',
    },
    propComtainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#239fdb',
        marginLeft: 5,
    },
    chatImage: {
        alignSelf: 'center',
        width: 40,
        height: 40,
    },
    currencyContainer: {
        marginRight: 8,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        marginBottom: 5,
    },
    currencyText: {
        fontSize: 12,
        marginLeft: 20,
        color: '#EEEEEE',
    },
    separator: {
        height: 1,
        width: sr.w,
        backgroundColor: '#EEEEEE'
    },
});
