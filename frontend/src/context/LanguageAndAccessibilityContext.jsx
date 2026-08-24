import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageAndAccessibilityContext = createContext(null);

// Bilingual translation dictionary for key government and portal labels
export const translations = {
  en: {
    govIndia: 'Government of India',
    ministry: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture & Farmers Welfare',
    portalTitle: 'Kisan Procurement Portal',
    portalSubtitle: 'Digital Procurement & Queue Management System',
    skipToContent: 'Skip to Main Content',
    accessibility: 'Accessibility',
    farmerLogin: 'Farmer Login',
    farmerRegister: 'Farmer Registration',
    adminLogin: 'Admin Login',
    logout: 'Logout',
    home: 'Home',
    aboutUs: 'About Us',
    procurementCentres: 'Procurement Centres',
    howItWorks: 'How It Works',
    farmerServices: 'Farmer Services',
    helpSupport: 'Help & Support',
    contactUs: 'Contact Us',
    bookSlot: 'Book Procurement Slot',
    trackQueue: 'Check Queue Status',
    trackApplication: 'Track Application',
    procurementStatus: 'Procurement Status',
    paymentStatus: 'Payment Status',
    downloadReceipt: 'Download Receipt',
    dashboard: 'Dashboard',
    myQueue: 'My Queue',
    payments: 'Payments',
    profile: 'Profile',
    slots: 'Slot Management',
    queue: 'Queue Management',
    procurement: 'Procurement Entry',
    noticeHeader: 'Important Notice',
    noticeText: 'Farmers can book procurement slots online in advance and avoid long queues at Mandis / Procurement Centres.',
    viewAllNotices: 'View All Notices',
    footerCopyright: 'Portal Designed, Developed and Maintained for Department of Agriculture & Farmers Welfare, Government of India.',
    helpline: 'Toll-Free Kisan Helpline: 1800-180-1551',
  },
  hi: {
    govIndia: 'भारत सरकार',
    ministry: 'कृषि एवं किसान कल्याण विभाग, कृषि एवं किसान कल्याण मंत्रालय',
    portalTitle: 'राष्ट्रीय किसान अधिप्राप्ति पोर्टल',
    portalSubtitle: 'डिजिटल खरीद एवं कतार प्रबंधन प्रणाली',
    skipToContent: 'मुख्य सामग्री पर जाएं',
    accessibility: 'सुगमता / Accessibility',
    farmerLogin: 'किसान लॉगिन',
    farmerRegister: 'किसान पंजीकरण',
    adminLogin: 'अधिकारी लॉगिन',
    logout: 'लॉगआउट',
    home: 'मुख्य पृष्ठ',
    aboutUs: 'हमारे बारे में',
    procurementCentres: 'खरीद केंद्र',
    howItWorks: 'कार्यप्रणाली',
    farmerServices: 'किसान सेवाएं',
    helpSupport: 'सहायता एवं समर्थन',
    contactUs: 'संपर्क करें',
    bookSlot: 'खरीद स्लॉट बुक करें',
    trackQueue: 'कतार स्थिति देखें',
    trackApplication: 'आवेदन ट्रैक करें',
    procurementStatus: 'खरीद की स्थिति',
    paymentStatus: 'भुगतान स्थिति (DBT)',
    downloadReceipt: 'रसीद डाउनलोड करें',
    dashboard: 'डैशबोर्ड',
    myQueue: 'मेरी कतार',
    payments: 'भुगतान विवरण',
    profile: 'किसान प्रोफाइल',
    slots: 'स्लॉट प्रबंधन',
    queue: 'कतार प्रबंधन',
    procurement: 'तौल एवं खरीद प्रविष्टि',
    noticeHeader: 'महत्वपूर्ण सूचना',
    noticeText: 'किसान भाई-बहन अपनी उपज की बिक्री हेतु अग्रिम ऑनलाइन स्लॉट बुक करें एवं केंद्रों पर भीड़ से बचें।',
    viewAllNotices: 'सभी सूचनाएं देखें',
    footerCopyright: 'कृषि एवं किसान कल्याण विभाग, भारत सरकार हेतु विकसित एवं अनुरक्षित।',
    helpline: 'किसान कॉल सेंटर टोल-फ्री: 1800-180-1551',
  }
};

export const LanguageAndAccessibilityProvider = ({ children }) => {
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  const [fontSize, setFontSize] = useState('md'); // 'sm' | 'md' | 'lg'

  // Apply font size class to root html element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-sm', 'font-md', 'font-lg');
    root.classList.add(`font-${fontSize}`);
  }, [fontSize]);

  const toggleLanguage = (selectedLang) => {
    setLang(selectedLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageAndAccessibilityContext.Provider
      value={{
        lang,
        setLang: toggleLanguage,
        fontSize,
        setFontSize,
        t,
      }}
    >
      {children}
    </LanguageAndAccessibilityContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LanguageAndAccessibilityContext);
  if (!context) {
    throw new Error('useLang must be used within LanguageAndAccessibilityProvider');
  }
  return context;
};
