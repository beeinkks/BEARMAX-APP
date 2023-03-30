import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Pressable} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { io } from "socket.io-client";


export default function Loading( {navigation} ) {
  const [socket, setSocket] = useState(null);
  var [subtitle, setSubtitle] = useState(null);

  useEffect(() => {
    const socket = io.connect("https://localhost:8080");

    // Not sure how necassary this part is.
    /* newsocket.on('connect', msg => { // connect not connection
      console.log('joined.')
      setMessage(messages=>messages.concat(msg));
      setSocket(newSocket);
    });*/

    // socket.on("speak", msg => console.log("Robot says: '" + msg + "'"))
    socket.on("speak", msg => setSubtitle(msg))

  });

  
  const emotionGame = async (event) => {
    socket.emit("emotionGame", "start");
  }

  const calibrate = async (event) => {
    socket.emit("recalibrate")
  }


  
  return (
    <View style={styles.container}>
        <Image 
            style={styles.logo}
            source={require('./../assets/face.png')} 
        />

        <Text style={styles.assist}>Place Holder for Bearmax STT</Text>

        <View style={styles.container2}>
          <Pressable style={styles.button} onPress={calibrate} >
            <Text style={styles.text}>Calibrate</Text>
          </Pressable>

          <Pressable style={styles.button1} onPress={emotionGame}>
            <Text style={styles.text}>Emotion Recognition</Text>
          </Pressable>
        </View>

        <View style={styles.container2}>
          <Pressable style={styles.button1} >
            <Text style={styles.text}>Help</Text>
          </Pressable>
          <Pressable style={styles.button} >
            <Text style={styles.text}>Engage</Text>
          </Pressable>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#856A5d',
    alignItems: 'center'
  },
  container2: {
    flexDirection: 'row',
    marginTop: 20,
  },
  logo: {
    width: 250, 
    height: 250,
    marginTop: 50,
  },
  button: {
    backgroundColor: '#56b19c',
    paddingVertical: 40,
    width: 180,
    height: 100,
    borderRadius: 4,
    elevation: 3,
    marginRight: 8,
    
  },
  button1: {
    backgroundColor: '#35604e',
    paddingVertical: 40,
    height: 100,
    width: 180,
    borderRadius: 4,
    elevation: 3,
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
    textAlign: 'center'
  },
  assist: {
    backgroundColor: '#60463b',
    width: 365,
    height: 50,
    textAlign: 'center',
    paddingVertical: 15,
    marginTop: 50,

    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});
