import React from 'react'
import {Dimensions, Modal, View} from 'react-native'
import { BlurView } from "@react-native-community/blur";
import Button from '../Button'
import {styles} from './style'

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window')

const CustomModal = ({animationType = "slide", visible, onClose, children, full = false, showCloseButton = true}: CustomModalProps) => {

    return (
        <BlurView blurType="dark" style={styles.absolute}>
            <Modal
                animationType={animationType}
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={[styles.modalView, {marginTop: viewportHeight / 5}, full ? {flex: 1} : {flex: 0.6}]}>
                    {children}
                    {showCloseButton && <Button size="small" title="Close" onPress={onClose} /> }
                </View>
            </Modal>
        </BlurView>
    )
}

export default CustomModal;