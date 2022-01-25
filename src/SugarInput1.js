import React, { Component } from 'react';
import { Button, CheckBox } from 'react-native-elements'
import {
  StyleSheet, Dimensions, Text, View, TouchableOpacity, TextInput, Alert, Platform, FlatList, Image, ToastAndroid, SafeAreaView
} from 'react-native';
import GradientButton from "react-native-gradient-buttons";
import { createAppContainer, createDrawerNavigator, createStackNavigator, DrawerItems } from "react-navigation";
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import ListView from "deprecated-react-native-listview";
import HorizontalDatePicker from '@logisticinfotech/react-native-horizontal-date-picker';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as loc,
  removeOrientationListener as rol
} from 'react-native-responsive-screen';
import moment from "moment";
import User from '../User';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import Globals from '../Globals';

class HamburgerIcon extends Component {
  toggleDrawer = () => {
    this.props.navigationProps.toggleDrawer();
  }
  goback = () => {
    this.props.navigationProps.goBack(null);
  }
  render() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <TouchableOpacity onPress={this.goback.bind(this)} >
          <Image
            source={require("./image/back.png")}
            style={{ tintColor: '#fff', resizeMode: 'contain', width: 50, height: 50, marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

class Home_Screen extends Component {

  static navigationOptions =
    {
      title: 'SUGAR VALUES',

    };
  getSugarData = () => {

    return fetch(Globals.base_url + 'apptapp/Sugar/showsugar.php', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({

        patient_id: this.state.patient_id,
        date: this.state.TextInput_date,

      })

    }).then((response) => response.json())
      .then((responseJson) => {
        //console.log(responseJson);
        if (responseJson.result == 1) {
          this.setState({
            TextInput_fasting: responseJson.data[0].fasting,
            TextInput_pp1: responseJson.data[0].pp1,
            TextInput_pp2: responseJson.data[0].pp2,
            TextInput_pp3: responseJson.data[0].pp3
          })
        }
      }).catch((error) => {
        console.error(error);
      });
  }
  constructor(props) {

    super(props)
    var { params } = this.props.navigation.state;
    console.log(params)
    this.state = {
      name: User.name,
      email: User.email,
      batch_id: User.batch_id,
      phone: User.phone,
      info: "",
      TextInput_fasting: params.fasting,
      TextInput_pp1: params.pp1,
      TextInput_pp2: params.pp2,
      TextInput_pp3: params.pp3,
      patient_id: User.patient_id,
      currentUserfirebase_id: User.firebase_id,
      currentDate: new Date(),
      markedDate: moment(new Date()).format("YYYY-MM-DD"),
      TextInput_date: moment(new Date()).format("YYYY-MM-DD")
    }
    //this.getSugarData();
    //console.log(this.state.TextInput_fasting)
    //console.log(this.state.TextInput_pp1)
    //console.log(this.state.TextInput_pp2)
    //console.log(this.state.TextInput_pp3)
  }

  componentDidMount() {
    this.getSugarData();
  }
  sendPushNotification = async (doctorToken, notification_data) => {
    console.log('doctor_token=>' + doctorToken + 'patient=>' + User.name);
    const message = {
      to: doctorToken,
      sound: 'default',
      title: 'Sugar Logs',
      body: `Sugar Values Inserted By ${User.name}`,
      vibrate: true,
      data: notification_data,
      _displayInForeground: true,
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const data = response._bodyInit;
    //console.log('tessssssss');
    console.log(`Status & Response ID-> ${JSON.stringify(data)}`);
  };


  onDateSelected = date => {
    this.state.TextInput_date = date;
    console.log("Selected Date:==>", date);
  }

  InsertSugarInputToServer = () => {

    fetch(Globals.base_url + 'apptapp/Sugar/InsertSugar.php', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fasting: this.state.TextInput_fasting,
        pp1: this.state.TextInput_pp1,
        pp2: this.state.TextInput_pp2,
        pp3: this.state.TextInput_pp3,
        patient_id: this.state.patient_id,
        date: this.state.TextInput_date,
      })

    }).then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.result == '1') {
          if (responseJson.doctor_token != '') {

            this.sendPushNotification(responseJson.doctor_token, responseJson.data);
            console.log('token checked');
          }
          console.log('token cleared=>' + responseJson.doctor_token);
          this.props.navigation.navigate('DefaultScreen1');
        } else {
          ToastAndroid.show(responseJson.message, ToastAndroid.SHORT);
        }
      }).catch((error) => {
        console.error(error);
      });
  }
  GoTo_Show_StudentList_Activity_Function = () => {
    this.props.navigation.navigate('Second');
  }
  gotoNextActivity = () => {
    this.props.navigation.navigate('Second');
  }

  render() {
    const today = this.state.currentDate;
    const day = moment(today).format("dddd");
    const date = moment(today).format("MMMM D, YYYY");
    const dateMinusOneMonth = moment(today).subtract(1, 'months');
    return (
      <View>
        <HorizontalDatePicker style={{ backgroundColor: "#c0c5ce", align: "center", justify: "center", textAlign: "center" }}
          pickerType={'date'}
          defaultSelected={today}
          minDate={today}
          maxDate={today}
          onDateSelected={this.onDateSelected}
          returnDateFormat={'YYYY-MM-DD'}
        />
        <View style={{
          backgroundColor: '#e8f7ff',
          height: '100%',


        }}>
          <SafeAreaView>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Fasting"
                  value={this.state.TextInput_fasting}
                  onChangeText={TextInputValue => this.setState({ TextInput_fasting: TextInputValue })}

                  keyboardType={'numeric'}
                  style={{
                    justifyContent: 'flex-start', textAlign: 'center',
                    marginBottom: 20,
                    marginTop: 20,
                    width: wp('42%'),
                    height: 120,
                    marginLeft: 20,
                    borderColor: '#FF5722',
                    backgroundColor: '#fff',
                    fontSize: 20,
                    fontWeight: '400',
                    fontStyle: 'italic'
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="PP1"
                  value={this.state.TextInput_pp1}
                  onChangeText={TextInputValue => this.setState({ TextInput_pp1: TextInputValue })}
                  underlineColorAndroid='transparent'
                  keyboardType={'numeric'}
                  style={{
                    justifyContent: 'flex-end', textAlign: 'center',
                    marginBottom: 20,
                    marginTop: 20,
                    width: wp('42%'),
                    height: 120,
                    marginLeft: 12,
                    borderColor: '#FF5722',
                    backgroundColor: '#fff',
                    fontSize: 20,
                    fontWeight: '400',
                    fontStyle: 'italic'
                  }}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", marginTop: -20 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="PP2"
                  value={this.state.TextInput_pp2}
                  onChangeText={TextInputValue => this.setState({ TextInput_pp2: TextInputValue })}
                  underlineColorAndroid='transparent'
                  keyboardType={'numeric'}
                  style={{
                    justifyContent: 'flex-start', textAlign: 'center',
                    marginTop: -290,
                    width: wp('42%'),
                    height: 120,
                    marginTop: 20,
                    marginLeft: 20,
                    borderColor: '#FF5722',
                    backgroundColor: '#fff',
                    fontSize: 20,
                    fontWeight: '400',
                    fontStyle: 'italic'
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput

                  placeholder="PP3"
                  value={this.state.TextInput_pp3}
                  onChangeText={TextInputValue => this.setState({ TextInput_pp3: TextInputValue })}
                  underlineColorAndroid='transparent'
                  keyboardType={'numeric'}
                  style={{
                    justifyContent: 'flex-start', textAlign: 'center',
                    marginTop: -290,
                    width: wp('42%'),
                    height: 120,
                    marginTop: 20,
                    marginLeft: 12,
                    borderColor: '#FF5722',
                    backgroundColor: '#fff',
                    fontSize: 20,
                    fontWeight: '400',
                    fontStyle: 'italic'
                  }}
                />
              </View>
            </View>
          </SafeAreaView>

          <TouchableOpacity activeOpacity={.4} style={styles.TouchableOpacityStyle} onPress={this.InsertSugarInputToServer} >
            <GradientButton
              style={{ marginTop: 5 }}
              textStyle={{ fontSize: 20, fontStyle: 'italic' }}
              text="SUBMIT"
              height={50}
              gradientBegin="#00b8ff"
              gradientEnd="#0083ff"
              onPressAction={this.InsertSugarInputToServer}
            />

          </TouchableOpacity>
          <TouchableOpacity activeOpacity={.4} style={styles.TouchableOpacityStyle} >
            <GradientButton
              style={{ marginTop: 5 }}
              textStyle={{ fontSize: 20, fontStyle: 'italic' }}
              text="LOGS"
              height={50}
              gradientBegin="#00b8ff"
              gradientEnd="#0083ff"
              onPressAction={() => this.props.navigation.navigate("DefaultScreen1")} />

          </TouchableOpacity>

        </View>
      </View>
    );
  }
}
class Settings_Screen extends Component {

  static navigationOptions =
    {
      title: 'BP VALUES',
    };

  getBPData = () => {
    return fetch(Globals.base_url + 'apptapp/Sugar/showbp.php', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patient_id: this.state.patient_id,
        date: this.state.TextInput_date,
      })
    }).then((response) => response.json())
      .then((responseJson) => {
        //console.log(responseJson);
        if (responseJson.result == 1) {
          this.setState({
            TextInput_bp_max: responseJson.data[0].bp_max,
            TextInput_bp_min: responseJson.data[0].bp_min,
          })
        }
      }).catch((error) => {
        console.error(error);
      });
  }

  constructor(props) {
    super(props)
    var { params } = this.props.navigation.state;
    console.log(params)
    this.state = {
      name: User.name,
      email: User.email,
      batch_id: User.batch_id,
      phone: User.phone,
      info: "",
      TextInput_bp_max: params.bp_max,
      TextInput_bp_min: params.bp_min,
      patient_id: User.patient_id,
      currentUserfirebase_id: User.firebase_id,
      currentDate: new Date(),
      markedDate: moment(new Date()).format("YYYY-MM-DD"),
      TextInput_date: moment(new Date()).format("YYYY-MM-DD")
    }
    //console.log(this.state.TextInput_bp_max)
    //console.log(this.state.TextInput_bp_min)
  }
  onDateSelected = date => {
    this.state.TextInput_date = date;
    console.log("Selected Date:==>", date);
  }
  sendPushNotification = async (doctorToken, notification_data) => {

    const message = {
      to: doctorToken,
      sound: 'default',
      title: 'BP Logs',
      body: `BP Values Inserted By ${User.name}`,
      vibrate: true,
      data: notification_data,
      _displayInForeground: true,
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const data = response._bodyInit;
    //console.log(`Status & Response ID-> ${JSON.stringify(data)}`);
  };

  componentDidMount() {

    this.getBPData();
    this._notificationSubscription = Notifications.addNotificationResponseReceivedListener(this._handleNotification);
  }
  InsertStudentRecordsToServer = () => {
    fetch(Globals.base_url + 'apptapp/Sugar/InsertBP.php', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bp_max: this.state.TextInput_bp_max,
        bp_min: this.state.TextInput_bp_min,
        patient_id: this.state.patient_id,
        date: this.state.TextInput_date,
      })

    }).then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.result == '1') {
          if (responseJson.doctor_token != '') {
            this.sendPushNotification(responseJson.doctor_token, responseJson.data);
            console.log('my name is khan');
          }
          this.props.navigation.navigate('DefaultScreen1', {
            patient_id: this.state.patient_id,
            name: this.state.name,
            email: this.state.email,
            batch_id: this.state.batch_id,
            phone: this.state.phone
          });
        } else {
          ToastAndroid.show(responseJson.message, ToastAndroid.SHORT);
        }
      }).catch((error) => {
        console.error(error);
      });

  }

  GoTo_Show_StudentList_Activity_Function = () => {
    this.props.navigation.navigate('Second');
  }

  gotoNextActivity = () => {
    this.props.navigation.navigate('Second');
  }
  render() {
    const today = this.state.currentDate;
    const day = moment(today).format("dddd");
    const date = moment(today).format("MMMM D, YYYY");
    return (
      <View>
        <HorizontalDatePicker style={{ align: "center", justify: "center", textAlign: "center" }}
          pickerType={'date'}
          defaultSelected={today}
          minDate={today}
          maxDate={today}
          onDateSelected={this.onDateSelected}
          returnDateFormat={'YYYY-MM-DD'}
        />
        <View style={{
          backgroundColor: '#e8f7ff',
          height: '100%',

        }}>
          <View style={{ flexDirection: "row" }}>
            <View >
              <TextInput
                placeholder="BP MAX"
                value={this.state.TextInput_bp_max}
                onChangeText={TextInputValue => this.setState({ TextInput_bp_max: TextInputValue })}
                underlineColorAndroid='transparent'
                keyboardType={'numeric'}
                style={{
                  justifyContent: 'flex-start', textAlign: 'center',
                  marginTop: 100,
                  width: 120,
                  height: 120,
                  marginLeft: 20,
                  borderColor: '#FF5722',
                  backgroundColor: '#fff',
                  fontSize: 20,
                  fontWeight: '400',
                  fontStyle: 'italic'
                }}
              />
            </View>
            <Text style={{ fontSize: 100, marginTop: 100, }}> / </Text>
            <View >
              <TextInput

                placeholder="BP MIN"
                value={this.state.TextInput_bp_min}
                onChangeText={TextInputValue => this.setState({ TextInput_bp_min: TextInputValue })}
                underlineColorAndroid='transparent'
                keyboardType={'numeric'}
                style={{
                  justifyContent: 'flex-end', textAlign: 'center',
                  marginTop: 100,
                  width: 120,
                  height: 120,
                  marginLeft: 0,
                  borderColor: '#FF5722',
                  backgroundColor: '#fff',
                  fontSize: 20,
                  fontWeight: '400',
                  fontStyle: 'italic'
                }}
              />
            </View>
          </View>

          <TouchableOpacity activeOpacity={.4} style={styles.TouchableOpacityStyle} onPress={this.InsertStudentRecordsToServer} >

            <GradientButton
              style={{ marginTop: 5 }}
              textStyle={{ fontSize: 20, fontStyle: 'italic' }}
              text="SUBMIT"
              height={50}
              gradientBegin="#00b8ff"
              gradientEnd="#0083ff"
              onPressAction={this.InsertStudentRecordsToServer}
            />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={.4}
            style={styles.TouchableOpacityStyle}
          >

            <GradientButton
              style={{ marginTop: 5 }}
              textStyle={{ fontSize: 20, fontStyle: 'italic' }}
              text="LOGS"
              height={50}
              gradientBegin="#00b8ff"
              gradientEnd="#0083ff"
              onPressAction={() => this.props.navigation.navigate("DefaultScreen1", {
                patient_id: this.state.patient_id,
                name: this.state.name,
                email: this.state.email,
                batch_id: this.state.batch_id,
                phone: this.state.phone
              })} />

          </TouchableOpacity>
        </View>

      </View>
    );
  }
}

class Student_Screen extends Component {

  static navigationOptions =
    {
      title: '',

    };
  constructor(props) {
    super(props);

    this.state = {
      name: User.name,
      email: User.email,
      batch_id: User.batch_id,
      patient_id: User.patient_id,
      phone: User.phone,
      info: "",
    };
  }
  gotoNextActivity = () => {
    this.props.navigation.navigate('Forth');

  }

  render() {

    return (

      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image style={styles.avatar}
              source={{ uri: 'https://bootdey.com/img/Content/avatar/avatar6.png' }} />

            <Text style={styles.name}>{this.state.name} </Text>
            <Text style={styles.userInfo}>{this.state.email} </Text>
            <Text style={styles.userInfo}>{this.state.phone} </Text>
            <Text style={styles.userInfo}>{this.state.patient_id} </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.item}>
            <View style={styles.iconContent}>
              <Image style={styles.icon} source={{ uri: 'https://img.icons8.com/material-outlined/24/000000/home--v2.png' }} />
            </View>
            <View style={styles.infoContent}>


              <Button
                title='Home'
                onPress={() => this.props.navigation.navigate("pro1")}
                titleStyle={{
                  color: '#039BE5',
                  fontSize: 18,
                  marginTop: 15,

                }}
                type='clear'
              />
            </View>
          </View>

          <View style={styles.item}>
            <View style={styles.iconContent}>
              <Image style={styles.icon} source={{ uri: 'https://img.icons8.com/material-outlined/24/000000/membership-card.png' }} />
            </View>
            <View style={styles.infoContent}>
              <Button
                title='My Subscriptions'
                onPress={() => this.props.navigation.navigate("pro1")}
                titleStyle={{
                  color: '#039BE5',
                  fontSize: 18,
                  marginTop: 10,

                }}
                type='clear'
              />

            </View>
          </View>

          <View style={styles.item}>
            <View style={styles.iconContent}>
              <Image style={styles.icon} source={{ uri: 'https://img.icons8.com/material-outlined/24/000000/mobile-payment.png' }} />
            </View>
            <View style={styles.infoContent}>
              <Button
                title='Payment History'
                onPress={() => this.props.navigation.navigate("pro1")}
                titleStyle={{
                  color: '#039BE5',
                  fontSize: 18,
                  marginTop: 10,

                }}
                type='clear'
              />
            </View>
          </View>

          <View style={styles.item}>
            <View style={styles.iconContent}>
              <Image style={styles.icon} source={{ uri: 'https://img.icons8.com/material-outlined/24/000000/survey.png' }} />
            </View>
            <View style={styles.infoContent}>
              <Button
                title='Know Your Prakirti'
                onPress={() => this.props.navigation.navigate("pro1")}
                titleStyle={{
                  color: '#039BE5',
                  fontSize: 18,
                  marginTop: 10,

                }}
                type='clear'
              />
            </View>
          </View>

          <View style={styles.item}>
            <View style={styles.iconContent}>
              <Image style={styles.icon} source={{ uri: 'https://img.icons8.com/material-outlined/24/000000/about.png' }} />
            </View>
            <View style={styles.infoContent}>
              <Button
                title='About Us'
                onPress={() => this.props.navigation.navigate("pro1")}
                titleStyle={{
                  color: '#039BE5',
                  fontSize: 18,
                  marginTop: 10,

                }}
                type='clear'
              />
            </View>
          </View>

          <View style={styles.item}>
            <View style={styles.iconContent}>
              <Image style={styles.icon} source={{ uri: 'https://img.icons8.com/material-outlined/24/000000/add-contact-to-company.png' }} />
            </View>
            <View style={styles.infoContent}>
              <Button
                title='Contact Us'
                onPress={() => this.props.navigation.navigate("pro1")}
                titleStyle={{
                  color: '#039BE5',
                  fontSize: 18,
                  marginTop: 10,

                }}
                type='clear'
              />
            </View>
          </View>

          <View style={styles.item}>
            <View style={styles.iconContent}>
              <Image style={styles.icon} source={{ uri: 'https://img.icons8.com/material-outlined/24/000000/add-contact-to-company.png' }} />
            </View>
            <View style={styles.infoContent}>
              <Button
                title='Privacy Policy'
                onPress={() => this.props.navigation.navigate("pro1")}
                titleStyle={{
                  color: '#039BE5',
                  fontSize: 18,
                  marginTop: 10,

                }}
                type='clear'
              />
            </View>
          </View>

        </View>
      </View>
    );
  }
}


export const Tab_1 = createMaterialTopTabNavigator({
  First: {
    screen: Home_Screen,
  },
  Second: {
    screen: Settings_Screen,
  }
}, {
  tabBarPosition: 'top',

  swipeEnabled: true,

  tabBarOptions: {

    activeTintColor: '#fff',
    pressColor: '#004D40',
    inactiveTintColor: '#fff',
    style: {

      backgroundColor: '#00B8D4'

    },

    labelStyle: {
      fontSize: 16,
      fontWeight: '200',
      fontStyle: 'italic'
    }
  }

});

export const Tab_2 = createMaterialTopTabNavigator({
  Third: {
    screen: Student_Screen,
  },

}, {
  tabBarPosition: 'top',

  swipeEnabled: true,

  tabBarOptions: {

    activeTintColor: '#fff',
    pressColor: '#004D40',
    inactiveTintColor: '#fff',
    style: {
      marginTop: -70,
      backgroundColor: '#fff'

    },

    labelStyle: {
      fontSize: 16,
      fontWeight: '200',
      fontStyle: 'italic'
    }
  }

});

const First_2_Tabs = createStackNavigator({
  First: {
    screen: Tab_1,
    navigationOptions: ({ navigation }) => ({
      title: 'My Sugar & Vitals',
      headerTitleStyle: {
        fontStyle: 'italic'
      },
      headerLeft: <HamburgerIcon navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: '#74cdf0',
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
        marginTop: 0,
        height: Dimensions.get('window').height / 8,

        marginTop: 0,
        height: Dimensions.get('window').height / 8
      },
      headerTintColor: '#fff',
    })
  },
}, {
  headerLayoutPreset: 'center',
  fontStyle: 'italic',

});

const Second_2_Tabs = createStackNavigator({
  First: {
    screen: Tab_2,
    navigationOptions: ({ navigation }) => ({
      title: 'Profile',
      headerLeft: <HamburgerIcon navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: '#00B8D4',
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
        marginTop: 0,
        height: Dimensions.get('window').height / 8
      },
      headerTintColor: '#fff',
    })
  },
}, {
  headerLayoutPreset: 'center',
  fontStyle: 'italic',

});

const MyDrawerNavigator = createDrawerNavigator({

  Home: {

    screen: First_2_Tabs,

  },

  Profile: {

    screen: Second_2_Tabs,

  }

});

export default createAppContainer(MyDrawerNavigator);

const styles = StyleSheet.create({

  container: {

    flexDirection: 'row',
    flexWrap: 'wrap',

  },
  box: {
    backgroundColor: '#00BCD4',
    height: 150,
    margin: 5,
    width: 170,

  },


  GridViewBlockStyle: {

    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    height: 150,
    margin: 5,
    backgroundColor: '#00BCD4'

  }
  ,

  GridViewInsideTextItemStyle: {

    color: '#000000',
    padding: 10,
    fontSize: 17,
    justifyContent: 'center',
    textAlign: 'center',


  },
  itemIcon: {
    color: '#00b8ff',
    justifyContent: 'center',
    alignContent: 'center',
    paddingLeft: 30,
    paddingRight: 30,
    marginTop: 20,
    marginLeft: 20,
  },
  header: {
    backgroundColor: "#ffffff",
    width: '100%'
  },
  headerContent: {
    padding: 30,
    alignItems: 'center',
    width: '100%'
  },

  MainContainer: {


    justifyContent: 'center',
    backgroundColor: '#e8f7ff',
    height: '100%',


  },

  text:
  {
    fontSize: 22,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10
  },
  MainContainer_For_Show_StudentList_Activity: {

    flex: 1,
    paddingTop: (Platform.OS == 'ios') ? 20 : 0,
    marginLeft: 5,
    marginRight: 5

  },

  TextInputStyleClass: {


    textAlign: 'center',
    width: 80,
    height: 80,
    borderRadius: 180 / 2,
    borderColor: '#FF5722',
    backgroundColor: '#00BCD4'

  },

  TouchableOpacityStyle: {

    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 5,
    width: '90%',
    backgroundColor: '#e8f7ff',
    alignContent: 'center',
    alignSelf: 'center',

  },

  TextStyle: {
    color: '#fff',
    textAlign: 'center',
  },

  rowViewContainer: {
    fontSize: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    color: "#000000",
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 16,
    color: "#778899",
    fontWeight: '600',


  },
  body: {
    backgroundColor: "#ffffff",
    height: '100%',
    width: '100%',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
  },
  infoContent: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 5,
    marginLeft: -280
  },
  iconContent: {
    flex: 1,
    alignItems: 'flex-start',
    paddingRight: 5,
  },
  icon: {
    width: 30,
    height: 30,
    marginTop: 20,
    marginLeft: 10,
  },
  info: {
    fontSize: 18,
    marginTop: 20,
    color: "#000000",
  }



});