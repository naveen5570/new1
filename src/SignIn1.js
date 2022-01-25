import React from "react";
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Dimensions, ToastAndroid,
  AsyncStorage, Vibration, KeyboardAvoidingView
} from "react-native";
import Constants from "expo-constants";
import { RkAvoidKeyboard, RkCard } from "react-native-ui-kitten";
import { scale, scaleVertical } from "./utilities/scale";
import GradientButton from "react-native-gradient-buttons";
import { Button, CheckBox } from 'react-native-elements';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import User from '../User';
import Globals from '../Globals';


const styles = StyleSheet.create({
  screen: {
    paddingTop: Constants.statusBarHeight,
    paddingBottom: scaleVertical(24),
    paddingHorizontal: scale(16),
    flex: 1,
    backgroundColor: '#e8f7ff',
  },

  header: {
    marginTop: 75,
    alignItems: "center",
    justifyContent: "center"
  },
  image: {
    height: scaleVertical(100),
    resizeMode: "contain"
  },
  all: {
    marginTop: scaleVertical(24),
    marginLeft: -20,
    marginRight: -20,
    flex: 1,
    justifyContent: "center"
  },
  content: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: scaleVertical(300),
    marginRight: 8,
    marginLeft: 8,
    backgroundColor: '#e8f7ff',
    borderTopWidth: 50,

  },
  input: {
    borderWidth: 0.5,
    borderColor: "#00b8ff",
    borderRadius: 50,
    padding: 18,
    marginVertical: scaleVertical(6),

    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: 20
  },
  OR: {
    marginVertical: scaleVertical(12),
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A4A4A"
  },
  socialLogin: {
    height: 50,
    paddingVertical: 0,
    paddingHorizontal: 0
  },
  footer: {
    justifyContent: "space-between",
    marginTop: scaleVertical(28),
    paddingHorizontal: 8,
    paddingVertical: scaleVertical(12)
  },
  textRow: {
    flexDirection: "row",
    justifyContent: "center"
  }
});


export default class LoginView extends React.Component {
  static navigationOptions = {
    title: 'Login',
    header: null,
  }
  constructor(props) {
    super(props);
    this.state = {
      //Besure to change to "" after dev, 
      phone: "",
      password: "",
      loaded: false,
      expoPushToken: '',
      notification: {},

    }


  }
  registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = await Notifications.getExpoPushTokenAsync();
      console.log(token.data);
      this.setState({ expoPushToken: token.data });
    } else {
      alert('Must use physical device for Push Notifications');
    }


  };

  componentDidMount() {
    this.registerForPushNotificationsAsync();

    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = Notifications.addNotificationResponseReceivedListener(this._handleNotification);
  }
  _handleNotification = notification => {
    Vibration.vibrate();
    console.log(notification.data);
    this.setState({ notification: notification });
  };

  parseJsonForUserInfo(res) {
    userDetail = {
      'user_status': res.userDetail.approved,
      'email': res.userDetail.email,
      'name': res.userDetail.name,
      'role_id': res.userDetail.role_id,
      'phone': res.userDetail.phone,
      'patient_id': res.userDetail.patient_id,
      'avatar': res.userDetail.avatar,
      'currentUserfirebase_id': res.userDetail.firebase_id,
    };
    return userDetail;
  }
  componentDidMount() {
    this._loadAssetsAsync();
  }

  _loadAssetsAsync = async () => {
    await Font.loadAsync({
      Entypo: require("./assets/fonts/Entypo.ttf"),
    });
    this.setState({ loaded: true });
  };
  launchAppropriateView = async (res) => {

    Keyboard.dismiss();
    var { navigate } = this.props.navigation;
    User.name = res.userDetail.name
    User.phone = res.userDetail.phone
    User.token = this.state.expoPushToken
    User.avatar = res.userDetail.avatar
    User.email = res.userDetail.email
    User.firebase_id = res.userDetail.firebase_id
    User.doctorStatus = res.userDetail.doctorStatus
    User.role_id = res.userDetail.role_id
    User.approved = res.userDetail.approved

    User.app_access = null
    User.patient_id = null
    User.program_id = null
    User.batch_id = null
    if (res.userDetail.doctorStatus == "doctor") {
      //launch doctor view
      console.log('you are logged in as doctor');
      await AsyncStorage.setItem('isLoggedIn', '1');
      await AsyncStorage.setItem('userDetail', JSON.stringify(User));
      navigate("DoctorDashboard", this.parseJsonForUserInfo(res));
    }
    else if (res.userDetail.doctorStatus == "patient") {
      //launch patient view
      console.log('you are logged in as patient');
      User.patient_id = res.userDetail.patient_id
      User.program_id = res.userDetail.program_id
      User.batch_id = res.userDetail.batch_id
      User.app_access = res.userDetail.app_access
      await AsyncStorage.setItem('isLoggedIn', '1');
      await AsyncStorage.setItem('userDetail', JSON.stringify(User));
      navigate("PatientDashboard", this.parseJsonForUserInfo(res));
    }
    else if (res.userDetail.doctorStatus == "dietician") {
      //launch Dietician View

      await AsyncStorage.setItem('isLoggedIn', '1');
      await AsyncStorage.setItem('userDetail', JSON.stringify(User));
      navigate("DieticieanDashboard", this.parseJsonForUserInfo(res));
    }
    else {
      alert(res.message);
    }
    console.log(User)
  }
  handleLoginPress = async () => {

    try {
      let token1 = await Notifications.getExpoPushTokenAsync();
      //console.log(token1.data);
      const myRequest = new Request(Globals.base_url + 'apptapp/Back-end/Controller/LoginController.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: this.state.phone,
          password: this.state.password,
          deviceToken: token1.data
          //deviceToken: this.state.expoPushToken
        })
      });
      fetch(myRequest)
        .then((response) => response.json())
        .then((res) => {
          console.log(res)
          ToastAndroid.show(res.message, ToastAndroid.SHORT)
          if (res.result == 1) {

            this.launchAppropriateView(res);
          }
        });
    }
    catch (error) {
      console.log(error);
    }
  }
  render() {
    if (!this.state.loaded) {
      return <AppLoading />;
    }
    return (
      <KeyboardAvoidingView
        style={styles.screen}
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => Keyboard.dismiss()}
      >
        <View style={styles.all}>
          <Text>{this.state.orientation}</Text>
          <RkCard rkType="heroImage shadowed" style={styles.content}>
            <TextInput
              textContentType="phone"
              onChangeText={phone => this.setState({ phone: phone })}
              placeholder="Enter Phone Number"
              keyboardType={'numeric'}
              style={styles.input}
            />
            <TextInput
              textContentType="password"
              onChangeText={password => this.setState({ password: password })}
              secureTextEntry={true}
              placeholder="Enter Password"

              style={styles.input}
            />
            <GradientButton
              style={{ marginTop: 8 }}
              textStyle={{ fontSize: 20, fontFamily: 'Roboto', }}
              text="LOGIN"
              height={50}
              gradientBegin="#00b8ff"
              gradientEnd="#0083ff"
              onPressAction={this.handleLoginPress}
            />
            <View style={styles.textRow}>
              <View style={{ marginTop: 8 }}>
                <Button
                  title='Forgot Password'
                  onPress={() => this.props.navigation.navigate("ForgotPassword1")}
                  titleStyle={{
                    color: '#039BE5'
                  }}
                  type='clear'
                />
              </View>
            </View>
          </RkCard>
        </View>
        <View style={styles.footer}>
          <Button
            title='Don&rsquo;t have an account? SignUp'
            onPress={() => this.props.navigation.navigate("SignUp1")}
            titleStyle={{
              color: '#039BE5'
            }}
            type='clear'
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}


