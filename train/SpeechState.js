var React = require('react-native');

var {
    View,
    Text,
    Image,
    StyleSheet,
    PropTypes
} = React;

var sr = app.Screen;
var Toast = require('@remobile/react-native-toast').show;

module.exports =  React.createClass({
    getInitialState() {
        return {
            dataSource: this.props.data,
        };
    },
    render() {
        return (
           <View style={{flexDirection: 'row',}}>
               {this.state.dataSource.map(function(item, i){
                   return <View style={styles.container} key={i}>
                               <Text style={!item.isSpeech ? styles.stateTextStyle : styles.stateTextStyle2}>{item.speechState}</Text>
                               <Image
                                   resizeMode='cover'
                                   defaultSource={app.img.personal_default_head}
                                   source={{uri:item.userImg}}
                                   style={[!item.isSpeech ? styles.headImgStyle : styles.headImgStyle2,{borderColor:item.colorValue}]} />
                                <Text style={!item.isSpeech ? styles.nameStyle : styles.nameStyle2}>{item.userName}</Text>
                               <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 3,}}>
                                   <Text style={!item.isSpeech ? styles.levelStyle : styles.levelStyle2}>等级:{item.userLevel}</Text>
                                   <Text style={!item.isSpeech ? styles.jobStyle : styles.jobStyle2}>{item.userAlias}</Text>
                               </View>
                          </View>
               })}
           </View>
        );
    },
});

var styles = StyleSheet.create({
    container: {
      flex: 1,
      width: sr.w,
      height: sr.h/5,
      marginTop: 15,
      marginLeft: 5,
      marginRight: 5,
      flexDirection: 'column',
    },
    stateTextStyle: {
      fontSize: 11,
      color: '#FFFFFF',
      alignSelf: 'center',
    },
    stateTextStyle2: {
      fontSize: 10,
      marginTop: -10,
      color: '#FFFFFF',
      alignSelf: 'center',
    },
    headImgStyle: {
      width: 50,
      height: 50,
      alignSelf: 'center',
      borderRadius: 25,
      margin: 2,
      borderWidth:2,
    },
    headImgStyle2: {
      width: 70,
      height: 70,
      alignSelf: 'center',
      borderRadius: 35,
      margin: 2,
      borderWidth:2,
    },
    levelStyle: {
      fontSize: 9,
      color: '#FFFFFF',
    },
    levelStyle2: {
      fontSize: 12,
      color: '#FFFFFF',
    },
    jobStyle: {
      fontSize: 9,
      color: '#FFFFFF',
      marginLeft: 5,
    },
    jobStyle2: {
      fontSize: 12,
      color: '#FFFFFF',
      marginLeft: 5,
    },
    nameStyle: {
      fontSize: 13,
      color: '#FFFFFF',
      marginTop: 5,
      alignSelf: 'center'
    },
    nameStyle2: {
      fontSize: 15,
      color: '#FFFFFF',
      marginTop: 5,
      alignSelf: 'center'
    },
});
