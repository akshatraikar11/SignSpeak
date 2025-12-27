/**
 * Pre-trained TensorFlow.js ASL Model Integration
 * Using Fingerpose library for gesture classification
 */

import * as fp from 'fingerpose';

// ASL Gesture Definitions using Fingerpose
export const createASLGestures = () => {
    const gestures = [];

    // Thumbs Up - YES
    const thumbsUp = new fp.GestureDescription('YES');
    thumbsUp.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
    thumbsUp.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 1.0);
    thumbsUp.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0);
    thumbsUp.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
    thumbsUp.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
    thumbsUp.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
    gestures.push(thumbsUp);

    // Thumbs Down - NO
    const thumbsDown = new fp.GestureDescription('NO');
    thumbsDown.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
    thumbsDown.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalDown, 1.0);
    thumbsDown.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0);
    thumbsDown.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
    thumbsDown.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
    thumbsDown.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
    gestures.push(thumbsDown);

    // V / Peace Sign
    const peaceSign = new fp.GestureDescription('PEACE');
    peaceSign.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
    peaceSign.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
    peaceSign.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
    peaceSign.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
    peaceSign.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 0.8);
    gestures.push(peaceSign);

    // Open Palm - HELLO
    const openPalm = new fp.GestureDescription('HELLO');
    openPalm.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
    openPalm.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
    openPalm.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
    openPalm.addCurl(fp.Finger.Ring, fp.FingerCurl.NoCurl, 1.0);
    openPalm.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);
    gestures.push(openPalm);

    // Fist - STOP
    const fist = new fp.GestureDescription('STOP');
    fist.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1.0);
    fist.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0);
    fist.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
    fist.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
    fist.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
    gestures.push(fist);

    return gestures;
};

// Gesture Estimator
export const estimateGesture = (landmarks) => {
    const GE = new fp.GestureEstimator(createASLGestures());
    const gesture = GE.estimate(landmarks, 8.5); // Increased threshold from 7.5 to 8.5 for stricter matching

    if (gesture.gestures && gesture.gestures.length > 0) {
        // Sort by confidence
        const sorted = gesture.gestures.sort((a, b) => b.score - a.score);

        // Only return if confidence is high enough
        if (sorted[0].score >= 8.5) {
            return {
                name: sorted[0].name,
                confidence: sorted[0].score
            };
        }
    }

    return null;
};
