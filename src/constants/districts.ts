export interface District {
  nameEn: string;
  nameBn: string;
  isDhaka: boolean;
}

export const BANGLADESH_DISTRICTS: District[] = [
  // Dhaka Division
  { nameEn: 'Dhaka', nameBn: 'ঢাকা', isDhaka: true },
  { nameEn: 'Gazipur', nameBn: 'গাজীপুর', isDhaka: false },
  { nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', isDhaka: false },
  { nameEn: 'Tangail', nameBn: 'টাঙ্গাইল', isDhaka: false },
  { nameEn: 'Narsingdi', nameBn: 'নরসিংদী', isDhaka: false },
  { nameEn: 'Faridpur', nameBn: 'ফরিদপুর', isDhaka: false },
  { nameEn: 'Manikganj', nameBn: 'মানিকগঞ্জ', isDhaka: false },
  { nameEn: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', isDhaka: false },
  { nameEn: 'Gopalganj', nameBn: 'গোপালগঞ্জ', isDhaka: false },
  { nameEn: 'Madaripur', nameBn: 'মাদারীপুর', isDhaka: false },
  { nameEn: 'Rajbari', nameBn: 'রাজবাড়ী', isDhaka: false },
  { nameEn: 'Shariatpur', nameBn: 'শরীয়তপুর', isDhaka: false },
  { nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', isDhaka: false },

  // Rajshahi Division (Major Livestock & Dairy Hub)
  { nameEn: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', isDhaka: false },
  { nameEn: 'Pabna', nameBn: 'পাবনা', isDhaka: false },
  { nameEn: 'Bogura', nameBn: 'বগুড়া', isDhaka: false },
  { nameEn: 'Rajshahi', nameBn: 'রাজশাহী', isDhaka: false },
  { nameEn: 'Naogaon', nameBn: 'নওগাঁ', isDhaka: false },
  { nameEn: 'Natore', nameBn: 'নাটোর', isDhaka: false },
  { nameEn: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', isDhaka: false },
  { nameEn: 'Joypurhat', nameBn: 'জয়পুরহাট', isDhaka: false },

  // Chattogram Division
  { nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম', isDhaka: false },
  { nameEn: 'Cumilla', nameBn: 'কুমিল্লা', isDhaka: false },
  { nameEn: 'Feni', nameBn: 'ফেনী', isDhaka: false },
  { nameEn: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', isDhaka: false },
  { nameEn: 'Noakhali', nameBn: 'নোয়াখালী', isDhaka: false },
  { nameEn: 'Chandpur', nameBn: 'চাঁদপুর', isDhaka: false },
  { nameEn: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', isDhaka: false },
  { nameEn: "Cox's Bazar", nameBn: 'কক্সবাজার', isDhaka: false },
  { nameEn: 'Rangamati', nameBn: 'রাঙ্গামাটি', isDhaka: false },
  { nameEn: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', isDhaka: false },
  { nameEn: 'Bandarban', nameBn: 'বান্দরবান', isDhaka: false },

  // Khulna Division
  { nameEn: 'Khulna', nameBn: 'খুলনা', isDhaka: false },
  { nameEn: 'Jashore', nameBn: 'যশোর', isDhaka: false },
  { nameEn: 'Kushtia', nameBn: 'কুষ্টিয়া', isDhaka: false },
  { nameEn: 'Jhenaidah', nameBn: 'ঝিনাইদহ', isDhaka: false },
  { nameEn: 'Satkhira', nameBn: 'সাতক্ষীরা', isDhaka: false },
  { nameEn: 'Bagerhat', nameBn: 'বাগেরহাট', isDhaka: false },
  { nameEn: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', isDhaka: false },
  { nameEn: 'Meherpur', nameBn: 'মেহেরপুর', isDhaka: false },
  { nameEn: 'Narail', nameBn: 'নড়াইল', isDhaka: false },
  { nameEn: 'Magura', nameBn: 'মাগুরা', isDhaka: false },

  // Mymensingh Division
  { nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ', isDhaka: false },
  { nameEn: 'Jamalpur', nameBn: 'জামালপুর', isDhaka: false },
  { nameEn: 'Netrokona', nameBn: 'নেত্রকোণা', isDhaka: false },
  { nameEn: 'Sherpur', nameBn: 'শেরপুর', isDhaka: false },

  // Rangpur Division
  { nameEn: 'Rangpur', nameBn: 'রংপুর', isDhaka: false },
  { nameEn: 'Dinajpur', nameBn: 'দিনাজপুর', isDhaka: false },
  { nameEn: 'Gaibandha', nameBn: 'গাইবান্ধা', isDhaka: false },
  { nameEn: 'Kurigram', nameBn: 'কুড়িগ্রাম', isDhaka: false },
  { nameEn: 'Lalmonirhat', nameBn: 'লালমনিরহাট', isDhaka: false },
  { nameEn: 'Nilphamari', nameBn: 'নীলফামারী', isDhaka: false },
  { nameEn: 'Panchagarh', nameBn: 'পঞ্চগড়', isDhaka: false },
  { nameEn: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', isDhaka: false },

  // Sylhet Division
  { nameEn: 'Sylhet', nameBn: 'সিলেট', isDhaka: false },
  { nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার', isDhaka: false },
  { nameEn: 'Habiganj', nameBn: 'হবিগঞ্জ', isDhaka: false },
  { nameEn: 'Sunamganj', nameBn: 'সুনামগঞ্জ', isDhaka: false },

  // Barishal Division
  { nameEn: 'Barishal', nameBn: 'বরিশাল', isDhaka: false },
  { nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী', isDhaka: false },
  { nameEn: 'Bhola', nameBn: 'ভোলা', isDhaka: false },
  { nameEn: 'Pirojpur', nameBn: 'পিরোজপুর', isDhaka: false },
  { nameEn: 'Barguna', nameBn: 'বরগুনা', isDhaka: false },
  { nameEn: 'Jhalokathi', nameBn: 'ঝালকাঠি', isDhaka: false },
];

