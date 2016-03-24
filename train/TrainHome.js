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

var TrainWaitingView = require('./TrainWaitingView.js');
module.exports = React.createClass({
    getInitialState() {
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            dataSource: this.ds.cloneWithRows([]),
            listData: [],
        };
    },
    componentDidMount() {
        this.getTrainingInfo();
    },
    renderSeparator(sectionID, rowID) {
        return (
            <View style={styles.separator} key={sectionID+rowID}/>
        );
    },
    getTrainingInfo() {
        var param = {
            userID: app.personal.info.userID,
        };
        POST(app.route.ROUTE_GET_TRAINING_INFO, param, this.getTrainingInfoSuccess);
    },
    getTrainingInfoSuccess(data) {
        if (data.success) {
            this.setState({listData: data.context.trainingList});
            this.setState({dataSource: this.ds.cloneWithRows(data.context.trainingList)});
        } else {
            Toast(data.msg);
        }
    },
    doTrainPK(obj) {
        var route = {
            title: '训练场',
            component: TrainWaitingView,
            passProps: {sex:app.personal.info.sex,gameType:obj.trainingCode==10001?1:2}
        };
        app.navigator.push(route);
        app.audioManager.trainingID = obj.id;
    },
    doSelfTrain() {
        Toast('暂未开放');
    },
    renderRow(obj) {
        var backColor = obj.backColor;
        return (
            <View style={[styles.panelContainer,{backgroundColor: backColor}]}>
                <Image
                    resizeMode='contain'
                    defaultSource={app.img.common_default}
                    source={{uri: obj.trainingLogo}}
                    style={styles.icon} />
                <View style={styles.titleContainer}>
                    <Text
                        style={styles.titleText}>
                        {obj.trainingName}
                    </Text>
                    <Text style={styles.detailText}
                        numberOfLines={1}>
                        {obj.trainingIntroduce}
                    </Text>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={styles.detailText}>
                            获胜积分:{obj.victoryIntegral}
                        </Text>
                        <Text style={[styles.detailText, {marginLeft: 30}]}>
                            胜利场次:{obj.victoryTimes}场
                        </Text>
                    </View>
                    <View style={styles.entranceContainer}>
                        <TouchableOpacity style={styles.ownContainer}
                            onPress={this.doTrainPK.bind(null, obj)}>
                            <Text style={styles.entranceText}>PK训练</Text>
                            <Image
                                resizeMode='contain'
                                source={app.img.home_train_go}
                                style={styles.goIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.ownContainer, {right: 110}]}
                            onPress={this.doSelfTrain}>
                            <Text style={styles.entranceText}>自我训练</Text>
                            <Image
                                resizeMode='contain'
                                source={app.img.home_train_go}
                                style={styles.goIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    },
    render() {
        return (
            <View style={styles.container}>
                <View>
                    <ListView
                        dataSource={this.state.dataSource}
                        renderRow={this.renderRow}
                        renderSeparator={this.renderSeparator}
                        />
                </View>
            </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    panelContainer: {
        paddingVertical: 10,
        marginTop: 20,
        marginHorizontal: 5,
        width:sr.w-10,
        borderRadius: 10,
        flexDirection: 'row',
    },
    icon: {
        width: 40,
        height: 40,
        alignSelf: 'center',
        marginHorizontal: 10,
    },
    titleContainer: {
        flexDirection: 'column',
        alignSelf: 'center',
    },
    titleText: {
        fontSize: 16,
        color: 'white',
    },
    detailText: {
        fontSize: 12,
        color: '#EEEEEE',
        backgroundColor: 'transparent',
    },
    entranceContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: sr.w,
    },
    ownContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    entranceText: {
        fontSize: 14,
        color: 'white',
    },
    divisionContainer: {
        flexDirection: 'row',
        width: sr.w-40,
        marginTop: 20,
        alignItems: 'center',
        alignSelf: 'center',
    },
    separator: {
        height: 1,
        flex: 1,
        alignSelf: 'center',
        backgroundColor: '#b4b4b4',
    },
    goIcon: {
        height: 15,
        marginLeft: 10,
    },
});
