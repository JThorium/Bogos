import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

function CameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    // Set a fixed camera position and make it look at the origin
    camera.position.set(0, 0, 15); // Consistent with Canvas camera prop
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null; // This component doesn't render anything, it just controls the camera
}

export default CameraRig;
