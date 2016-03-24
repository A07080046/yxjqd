'use strict';

var React = require('react-native');
var Des = require('@remobile/react-native-des');
var Toast = require('@remobile/react-native-toast').show;

var {
    Image,
    StyleSheet,
    ListView,
    TextInput,
    Text,
    Button,
    View,
    TouchableOpacity,
} = React;

var sr = app.Screen;
var POST = app.POST;
var Button = app.components.Button;

module.exports = React.createClass({
    componentDidMount() {
        this.timer = setInterval(function () {
            this.getUpdateMessage();
        }.bind(this), 2000);
    },
    getInitialState() {
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            clickComment: false,
            dataSource: this.ds.cloneWithRows([]),
            listData: [],
            info: app.personal.info,
        };
    },
    getUpdateMessage() {
        var messageID = this.messageID||0;
        //第一次进来未获取到数据 所以先判断是否定义 先赋值messageID为0
        // if (this.lastMessageID === messageID) {
        //     return;
        // }
        var param = {
            roomID:this.props.roomID,
            userID:this.state.info.userID,
            messageID:messageID,
        };
        this.lastMessageID = this.messageID;
        POST(app.route.ROUTE_UPDATE_MESSAGE, param, this.doUpdateMessageSuccess);
    },
    doUpdateMessageSuccess(data) {
        if (data.success) {
            var infoList = data.context.infoList;
            if (infoList.length>0) {
                this.messageID = data.context.messageID;
                if (this.lastMessageID === this.messageID) {
                    return;
                }
                this.state.listData = this.state.listData.concat(infoList);
                this.setState({dataSource: this.ds.cloneWithRows(this.state.listData), });
                for (var item in infoList) {
                    //1-表示文本信息 2-表示道具信息
                    if (infoList[item].messageType===2) {
                        this.noticeShow(infoList[item].propCode);
                    }
                }
            }
        } else {
            Toast(data.msg);
        }
    },
    noticeShow(propCode) {
        this.show(()=>{
            this.props.noticeShow(propCode);
        });
    },
    show(callback) {
        return callback();
    },
    _onPressRow(obj) {
        this.setState({clickComment: !this.state.clickComment});
    },
    _doSend(obj) {
        this.setState({clickComment: !this.state.clickComment});
        var param = {
            roomID: this.props.roomID,
            userID: this.state.info.userID,
            content:this.state.content
        };
        POST(app.route.ROUTE_SEND_MESSAGE, param, this.doSendMessageSuccess);
    },
    doSendMessageSuccess(data) {
        if (data.success) {
            this.state.content = '';
        } else {
            Toast(data.msg);
        }
    },
    renderSeparator(sectionID, rowID) {
        return (
            <View style={styles.separator} key={sectionID+rowID}/>
        );
    },
    renderRow(obj) {
        return (
            <View style={styles.ItemContainer}>
                {obj.messageType===1?
                    <View style={{flexDirection: 'row'}}>
                    <Text
                        style={styles.itemNameText}>
                        {obj.userName}:
                    </Text>
                    <Text style={styles.itemChatText}>
                        {obj.content}
                    </Text>
                    </View>
                    :
                    <Text style={styles.itemPropText}>
                        {obj.fromUserName}给了{obj.toUserName}一个的{obj.propName}
                    </Text>
                }
            </View>
        )
    },
    render() {
        return (
                <View style={[styles.container, this.props.style]}>
                    <View style={{height: 65}}>
                        <ListView
                            dataSource={this.state.dataSource}
                            renderRow={this.renderRow}
                            renderSeparator={this.renderSeparator}
                            />
                    </View>
                    {this.state.clickComment === false?
                        <TouchableOpacity onPress={this._onPressRow.bind(null, this.state.clickComment)}>
                            <Image
                                resizeMode='contain'
                                source={app.img.train_chat}
                                style={styles.chatImage}>
                            </Image>
                        </TouchableOpacity>
                        :
                        <View style={styles.inputContainer}>
                            <TextInput
                                autoFocus={true}
                                onChangeText={(text) => this.setState({content: text})}
                                value={this.state.content}
                                placeholder="请输入内容"
                                style={styles.textInput}
                                />
                            <Button
                                onPress={this._doSend.bind(null, this.state.clickComment)}
                                style={styles.btnSend}
                                textStyle={styles.btnSendCodeText}>
                                发送
                            </Button>
                        </View>
                    }
                </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        height: 180,
    },
    ItemContainer: {
        marginHorizontal: 8,
        flexDirection: 'row',
    },
    itemNameText: {
        fontSize: 14,
        alignSelf: 'center',
        color: '#239fdb',
    },
    itemChatText: {
        fontSize: 14,
        flex: 1,
        alignSelf: 'center',
        marginLeft: 8,
        color: 'white',
    },
    itemPropText: {
        flex: 1,
        fontSize: 14,
        alignSelf: 'center',
        color: 'white',
    },
    chatImage: {
        width: 40,
        height: 40,
        bottom: 5,
        marginRight: 10,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        height: 35,
        bottom: 5,
        marginHorizontal: 8,
        borderRadius: 5,
        borderColor: '#D7D7D7',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems:'center',
    },
    textInput: {
        paddingLeft: 10,
        height:40,
        width: sr.w-100,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
    },
    btnSend: {
        flex: 1,
        height: 30,
        marginHorizontal: 3,
        borderRadius: 6,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#4FC1E9',
    },
    btnSendCodeText: {
        fontSize: 14,
        alignSelf: 'center',
    },
});
