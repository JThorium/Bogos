import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

function CameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    // Ensure camera looks at the origin (0,0,0)
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null; // This component doesn't render anything, it just controls the camera
}

export default CameraRig;
