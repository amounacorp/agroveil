import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { SettingsHeader } from '../../components/ui/SettingsHeader';

const FAQ = [
  {
    q: "Comment ajouter une caméra ?",
    a: "Les caméras sont configurées par votre administrateur via le portail web Aviora. Contactez votre gestionnaire de ferme ou l'équipe Aviora.",
  },
  {
    q: "Pourquoi je ne reçois pas d'alertes WhatsApp ?",
    a: "Vérifiez que votre numéro WhatsApp est correctement renseigné dans Paramètres > Notifications. Assurez-vous aussi que les alertes WhatsApp sont activées.",
  },
  {
    q: "Comment fonctionne la détection IA ?",
    a: "L'IA analyse en temps réel les images de vos caméras pour détecter les comportements anormaux : mortalité, stress thermique, inactivité, etc. Elle envoie une alerte dès que le seuil de confiance est dépassé.",
  },
  {
    q: "L'appli fonctionne-t-elle hors connexion ?",
    a: "Oui, les dernières données (alertes, statistiques) restent accessibles hors ligne. La synchronisation reprend automatiquement à la reconnexion.",
  },
  {
    q: "Comment créer un compte pour un autre fermier ?",
    a: "Utilisez le portail web Aviora ou l'option 'Créer un compte' sur l'écran de connexion de l'application mobile.",
  },
  {
    q: "Comment modifier mon mot de passe ?",
    a: "La modification du mot de passe n'est pas encore disponible dans l'app. Contactez le support Aviora pour un reset.",
  },
];

export default function HelpScreen() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <SettingsHeader title="Aide" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🌱</Text>
          <Text style={styles.heroTitle}>Guide d'utilisation</Text>
          <Text style={styles.heroSub}>Aviora — Surveillance avicole intelligente</Text>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        {FAQ.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.faqItem}
            onPress={() => setExpanded(expanded === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ}>{item.q}</Text>
              <Text style={styles.faqChevron}>{expanded === i ? '▲' : '▼'}</Text>
            </View>
            {expanded === i && (
              <Text style={styles.faqA}>{item.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Contact */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Nous contacter</Text>
        <View style={styles.card}>
          <ContactRow icon="📧" label="Support email" value="support@Aviora.com" onPress={() => Linking.openURL('mailto:support@Aviora.com')} />
          <View style={styles.divider} />
          <ContactRow icon="💬" label="WhatsApp Support" value="+242 06 XXX XXXX" onPress={() => Linking.openURL('https://wa.me/242060000000')} />
          <View style={styles.divider} />
          <ContactRow icon="🌐" label="Site web" value="Aviora.com" onPress={() => Linking.openURL('https://Aviora.com')} />
        </View>

        {/* Version */}
        <View style={styles.versionBox}>
          <Text style={styles.versionText}>Aviora Mobile v1.0.0</Text>
          <Text style={styles.versionSub}>© 2026 Aviora. Tous droits réservés.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactRow({ icon, label, value, onPress }: { icon: string; label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={contactStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={contactStyles.icon}>{icon}</Text>
      <View style={contactStyles.text}>
        <Text style={contactStyles.label}>{label}</Text>
        <Text style={contactStyles.value}>{value}</Text>
      </View>
      <Text style={contactStyles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.background },
  content:      { padding: 16, gap: 10 },
  hero:         { alignItems: 'center', paddingVertical: 24, gap: 6 },
  heroIcon:     { fontSize: 48 },
  heroTitle:    { fontSize: 20, fontWeight: '700', color: Colors.onSurface },
  heroSub:      { fontSize: 13, color: Colors.onSurfaceVariant },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, paddingVertical: 4 },
  faqItem:      { backgroundColor: Colors.surfaceContainer, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.outlineVariant + '40', gap: 8 },
  faqHeader:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  faqQ:         { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  faqChevron:   { fontSize: 11, color: Colors.onSurfaceVariant },
  faqA:         { fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 20 },
  card:         { backgroundColor: Colors.surfaceContainer, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  divider:      { height: 1, backgroundColor: Colors.outlineVariant + '40', marginLeft: 52 },
  versionBox:   { alignItems: 'center', paddingVertical: 16, gap: 4 },
  versionText:  { fontSize: 12, color: Colors.onSurfaceVariant },
  versionSub:   { fontSize: 11, color: Colors.outlineVariant },
});

const contactStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  icon:  { fontSize: 22, width: 28, textAlign: 'center' },
  text:  { flex: 1, gap: 2 },
  label: { fontSize: 13, color: Colors.onSurfaceVariant },
  value: { fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  arrow: { fontSize: 20, color: Colors.onSurfaceVariant },
});
