import { useEffect, useState } from 'react';
import * as FaceDetector from 'expo-face-detector'
import { Text, TouchableOpacity, View } from 'react-native';
import { Camera, CameraType, FaceDetectionResult, FlashMode } from 'expo-camera';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { styles } from './styles';

export function Home() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [isOnFlash, setOnFlash] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [propsFace, setPropsFace] = useState({});

  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const toggleFlash = () => setOnFlash(!isOnFlash);
  const handleFacesDetected = ({ faces }: FaceDetectionResult) => {
    const face = faces[0] as any;
    if (face) {
      const { size, origin } = face.bounds;
      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y,
      }
      setFaceDetected(true);
    }
    else
      setFaceDetected(false);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y },
    ],
    borderColor: 'blue',
    borderWidth: 10,
  }));

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission?.granted) return;


  return (
    <View style={styles.container}>
      {
        faceDetected &&
        <Animated.View style={animatedStyle} />
      }
      <Camera
        style={styles.camera}
        type={CameraType.front}
        flashMode={isOnFlash ? FlashMode.torch : FlashMode.off}
        {...propsFace}
        onCameraReady={() => {
          setPropsFace({
            onFacesDetected: handleFacesDetected,
            faceDetectorSettings: {
              mode: FaceDetector.FaceDetectorMode.fast,
              detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
              runClassifications: FaceDetector.FaceDetectorClassifications.all,
              minDetectInterval: 100,
              tracking: true,
            }
          })
        }}
      />
      <TouchableOpacity
        onPress={toggleFlash}>
        <Text>
          {"\n"}
          Flash
          {"\n"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
