import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WarningCircle, X } from 'phosphor-react-native';
import { colors, textStyles } from '../theme/typography';
import NeonBarButton from './NeonBarButton';
import { tokens } from '../theme/tokens';

const DeleteAccountModal = ({ visible, onClose, onConfirm, isDeleting }) => {
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  const handleClose = () => {
    setShowFinalConfirm(false);
    onClose();
  };

  const handleFirstContinue = () => {
    setShowFinalConfirm(true);
  };

  const handleFinalDelete = () => {
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            disabled={isDeleting}
          >
            <X size={24} color={colors.white} weight="bold" />
          </TouchableOpacity>

          {!showFinalConfirm ? (
            // FIRST WARNING SCREEN
            <>
              <View style={styles.iconContainer}>
                <WarningCircle size={64} color={colors.orange} weight="fill" />
              </View>

              <Text style={styles.title}>Delete Your Account?</Text>

              <View style={styles.warningBox}>
                <Text style={styles.warningText}>⚠️ This will permanently delete:</Text>
                <Text style={styles.warningItem}>• All workout history</Text>
                <Text style={styles.warningItem}>• Your progress and cycles</Text>
                <Text style={styles.warningItem}>• Your current max and stats</Text>
                <Text style={styles.warningItem}>• Your account and profile</Text>
              </View>

              <Text style={styles.subText}>This action cannot be undone.</Text>

              <View style={styles.buttonStack}>
                <NeonBarButton
                  title="CANCEL"
                  onPress={handleClose}
                  colors={{
                    primary: colors.electricCyan,
                    secondary: colors.electricCyan,
                    text: tokens.text.primary
                  }}
                  height={48}
                  showIcon={false}
                />

                <NeonBarButton
                  title="CONTINUE"
                  onPress={handleFirstContinue}
                  colors={{
                    primary: colors.orange,
                    secondary: colors.hotPink,
                    text: tokens.text.primary
                  }}
                  height={48}
                  showIcon={false}
                />
              </View>
            </>
          ) : (
            // FINAL CONFIRMATION SCREEN
            <>
              <View style={styles.iconContainer}>
                <WarningCircle size={64} color={colors.hotPink} weight="fill" />
              </View>

              <Text style={[styles.title, { color: colors.hotPink }]}>
                Are You Absolutely Sure?
              </Text>

              <Text style={styles.finalText}>
                Your account and all data will be deleted immediately and permanently.
              </Text>

              <Text style={[styles.finalText, { marginTop: 16, fontSize: 14 }]}>
                There is no way to recover your data after deletion.
              </Text>

              <View style={styles.buttonStack}>
                <NeonBarButton
                  title="CANCEL"
                  onPress={handleClose}
                  disabled={isDeleting}
                  colors={{
                    primary: colors.electricCyan,
                    secondary: colors.electricCyan,
                    text: tokens.text.primary
                  }}
                  height={48}
                  showIcon={false}
                />

                <TouchableOpacity
                  onPress={handleFinalDelete}
                  disabled={isDeleting}
                  style={[styles.dangerButton, isDeleting && { opacity: 0.5 }]}
                >
                  <LinearGradient
                    colors={[colors.hotPink, colors.orange]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.dangerButtonGradient}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.dangerButtonText}>YES, DELETE MY ACCOUNT</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'rgba(20, 20, 45, 0.98)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: colors.electricCyan,
    shadowColor: colors.electricCyan,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    ...textStyles.subTitle,
    fontSize: 22,
    color: colors.orange,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: colors.orange,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 107, 67, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.orange,
    marginBottom: 20,
  },
  warningText: {
    ...textStyles.bodyText,
    color: colors.orange,
    fontSize: 14,
    fontFamily: 'IBMPlexMono_700Bold',
    marginBottom: 12,
  },
  warningItem: {
    ...textStyles.bodyText,
    color: colors.white,
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 6,
  },
  subText: {
    ...textStyles.bodyText,
    color: colors.mediumGray,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  finalText: {
    ...textStyles.bodyText,
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonStack: {
    gap: 12,
    marginTop: 24,
  },
  dangerButton: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: colors.hotPink,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  dangerButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 14,
    color: colors.white,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

export default DeleteAccountModal;
