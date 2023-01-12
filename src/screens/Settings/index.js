/* eslint-disable */
import ActionButton from '@/components/buttons/ActionButton';
import FormInput from '@/components/FormInput';
import { useStore } from '@/hooks';
import * as Api from '@/services/api';
import { apiError2Message } from '@/utils';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { observer } from 'mobx-react';
import { Column, FormControl, HStack, Switch, Text } from 'native-base';
import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, View } from 'react-native';
import Geolocation from "react-native-geolocation-service";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Settings = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [location, setLocation] = useState(false);
  const store = useStore();
  const nav = useNavigation();

  const loadProfile = async () => {
    try {
      store.hud.show();
      const { name, gps_location, address, zip_code, latitude, longitude } = await Api.getUserProfile();
      setName(name);
      setIsSelected(gps_location);
      setAddress(address);
      setZipCode(zip_code);
      setLatitude(latitude);
      setLongitude(longitude);
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
          title: "Geolocation Permission",
          message: "Can we access your location?",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      console.log("granted", granted);
      if (granted === "granted") {
        console.log("You can use Geolocation");
        return true;
      } else {
        console.log("You cannot use Geolocation");
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const getLocation = async() => {
    const result = requestLocationPermission();
    result.then((res) => {
      console.log("res is:", res);
      if (res) {
        Geolocation.getCurrentPosition(
          (position) => {
            console.log(position, 'position....');
            setLocation(position);
            setLatitude(position?.coords?.latitude.toString());
            setLongitude(position?.coords?.longitude.toString());
           
          },
          (error) => {
            // See error code charts below.
            console.log(error.code, error.message);
            setLocation(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    });
    console.log(location);
  };

  const checkNull = (value) =>{
    if(value === null){
      return ''
    }else {
      return value + ', '
    }

  }

  useEffect(() => {

    const getPlace = async() =>{
      console.log(location,'location now...')
      if(location){
        const place = await Location.reverseGeocodeAsync({
          latitude: Number(location.coords.latitude),
          longitude: Number(location.coords.longitude)
        })  

        /* const place = await Location.reverseGeocodeAsync({
          latitude: Number('51.507351'),
          longitude: Number('-0.127758')
        })  */

        // console.log(place,'palce........')

        let placeName = place.map(p=> {
          if(p.postalCode){
            setZipCode(p.postalCode)
          }
          return (checkNull(p.streetNumber) + checkNull(p.street) + checkNull(p.city) + p.country)
        })
        // console.log(placeName,'placename....')
        if(placeName.length > 0){
          setAddress(placeName[0])
        }
        
      }else{
        setAddress('')
        setZipCode('')
      }
      
    }
    getPlace()

  }, [location])

  const getDeviceLocation = (value) => {
    console.log(value, "value...........");
    setIsSelected(value);
    if (value) {
      getLocation()
    } else {
      setLatitude('');
      setLongitude('');
      setAddress('')
      setZipCode('')
    }
  };

  React.useEffect(() => {
    loadProfile().then().catch(console.log);
  }, []);

  const onPressSave = async () => {
    try {
      store.hud.show();
      await Api.updateUserProfile({ 
        name, 
        gps_location: isSelected, 
        address, 
        zip_code: zipCode,
        latitude,
        longitude,
      });
      store.notification.showSuccess('Profile updated');
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
            textContentType={'name'}
            autoCapitalize={'words'}
          />
        </FormControl>
        <FormControl mt={3}>
          <FormControl.Label>Address</FormControl.Label>
          <FormInput onChangeText={setAddress} value={address} />
        </FormControl>
        <FormControl
          mt={3}
        >
        <FormControl.Label>Use GPS</FormControl.Label>
          <View  style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}>
        <HStack mr={5}>
            <Switch
              size="lg"
              defaultIsChecked={isSelected}
              onValueChange={(value) => getDeviceLocation(value)}
            />
          </HStack>
          {
            <Text>
              {isSelected
                ? "Get Location from GPS"
                : "Set Location manullay"}
            </Text>
          }
        </View>
        </FormControl>
        <FormControl mt={3}>
          <FormControl.Label>ZIP Code</FormControl.Label>
          <FormInput onChangeText={setZipCode} value={zipCode} />
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

/* eslint-disable */
