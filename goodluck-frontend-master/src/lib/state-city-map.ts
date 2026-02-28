// ─── State → City Mapping ──────────────────────────────────────────────────────
// Used anywhere a city dropdown should be filtered by the selected state.

export const STATE_CITY_MAP: Record<string, string[]> = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kurnool"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini", "Laxmi Nagar", "Saket"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Rohtak", "Ambala", "Hisar"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Tumkur"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Thane"],
    "Manipur": ["Imphal", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura"],
    "Mizoram": ["Aizawl", "Lunglei"],
    "Nagaland": ["Kohima", "Dimapur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Brahmapur"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
    "Sikkim": ["Gangtok", "Namchi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
    "Tripura": ["Agartala", "Udaipur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Ghaziabad", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Mathura", "Moradabad"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Nainital"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
};

export const ALL_STATES = Object.keys(STATE_CITY_MAP).sort();

/** Returns cities for a given state. Falls back to empty array. */
export function getCitiesForState(state: string): string[] {
    return STATE_CITY_MAP[state] ?? [];
}
