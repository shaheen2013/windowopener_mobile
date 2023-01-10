import ActionButton from "@/components/buttons/ActionButton";
import FormInput from "@/components/FormInput";
import { useStore } from "@/hooks";
import * as Api from "@/services/api";
import { apiError2Message } from "@/utils";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react";
import { Checkbox, Column, FormControl, Text } from "native-base";
import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import RadioFilledIcon from "../../assets/svg/radio-filled.svg";
// import RadioEmptyIcon from "../../assets/svg/radio-empty.svg";

const Settings = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isSelected, setIsSelected] = useState(false);
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

  React.useEffect(() => {
    loadProfile().then().catch(console.log);
  }, []);

  const onPressSave = async () => {
    try {
      store.hud.show();
      await Api.updateUserProfile({ name, address });
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
            textContentType={"name"}
            autoCapitalize={"words"}
          />
        </FormControl>
        <FormControl mt={3}>
          <FormControl.Label>Address</FormControl.Label>
          <FormInput onChangeText={setAddress} value={address} />
        </FormControl>
        <FormControl mt={3}>
            <Checkbox checked={true} color="green"/>
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


