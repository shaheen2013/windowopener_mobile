/* eslint-disable  */
import ActionButton from "@/components/buttons/ActionButton";

import FormInput from "@/components/FormInput";
import { useStore } from "@/hooks";
import * as Api from "@/services/api";
import { apiError2Message } from "@/utils";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react";
import { Column, FormControl, HStack, Switch, Text } from "native-base";
import React, { useState } from "react";
import { PermissionsAndroid } from "react-native";
import Geolocation from 'react-native-geolocation-service';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


const Settings = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [location, setLocation] = useState(false);
  const store = useStore();
  const nav = useNavigation();

  const loadProfile = async () => {
    try {
      store.hud.show();
      const { name, address } = await Api.getUserProfile();
      setName(name);
      setAddress(address);
    } catch (ex) {
      const apiError = apiError2Message(ex);
      if (apiError) {
        store.notification.showError(apiError);
      } else {
        store.notification.showError(ex.message);
      }
    } finally {
      store.hud.hide();
    }
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('granted', granted);
      if (granted === 'granted') {
        console.log('You can use Geolocation');
        return true;
      } else {
        console.log('You cannot use Geolocation');
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const getLocation = () => {
    const result = requestLocationPermission();
    result.then(res => {
      console.log('res is:', res);
      if (res) {
        Geolocation.getCurrentPosition(
          position => {
            console.log("Latitude",position?.coords?.latitude,"Longitute",position?.coords?.longitude);
            setLocation(position);
            setLatitude(position?.coords?.latitude.toString());
            setLongitude(position?.coords?.longitude.toString());
          },
          error => {
            // See error code charts below.
            console.log(error.code, error.message);
            setLocation(false);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    });
    console.log(location);
  };

  const getDeviceLocation = (value) => {
    console.log(value,'value...........')
    setIsSelected(value)
    if(value){
      getLocation();
    }else{
      setLatitude("");
      setLongitude("");
    }
   
  }


  React.useEffect(() => {
    loadProfile().then().catch(console.log);
  }, []);

  const onPressSave = async () => {
    try {
      store.hud.show();
      await Api.updateUserProfile({ name, address });
      store.notification.showSuccess("Profile updated");
      nav.goBack();
    } catch (ex) {
      const apiError = apiError2Message(ex);
      if (apiError) {
        store.notification.showError(apiError);
      } else {
        store.notification.showError(ex.message);
      }
    } finally {
      store.hud.hide();
    }
  };



  return (
    <Column px={2} flex={1}>
      <KeyboardAwareScrollView flex={1}>
        <FormControl mt={3}>
          <FormControl.Label>Email</FormControl.Label>
          <Text>{store.user.email}</Text>
        </FormControl>
        <FormControl mt={3}>
          <FormControl.Label>Full Name</FormControl.Label>
          <FormInput
            onChangeText={setName}
            value={name}
            textContentType={"name"}
            autoCapitalize={"words"}
          />
        </FormControl>
        <FormControl mt={3}>
          <FormControl.Label>Address</FormControl.Label>
          <FormInput onChangeText={setAddress} value={address} />
        </FormControl>
        <FormControl style={{display:'flex',flexDirection:'row',alignItems:'center',}} mt={3}>
        <HStack  mr={5}>
          <Switch size="lg" defaultIsChecked={isSelected} onValueChange={(value)=>getDeviceLocation(value)}/>
        </HStack >
          {<Text>{isSelected ?"Get Location from Device":"Set Location manullay"}</Text>}
        </FormControl>
       

        <FormControl mt={3}>
          <FormControl.Label>Latitude</FormControl.Label>
          <FormInput onChangeText={setLatitude} value={latitude} />
        </FormControl>
        <FormControl mt={3}>
          <FormControl.Label>Longitude</FormControl.Label>
          <FormInput onChangeText={setLongitude} value={longitude} />
        </FormControl>
        <ActionButton mt={5} onPress={onPressSave}>
          Save
        </ActionButton>
      </KeyboardAwareScrollView>
    </Column>
  );
};

export default observer(Settings);

/* eslint-disable  */
