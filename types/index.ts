export type UserRole = "client" | "cleaner" | "admin";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "pending_completion";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface CleanerProfile {
  id: string;
  user_id: string;
  bio: string | null;
  hourly_rate: number;
  services: string[];
  location: string;
  is_verified: boolean;
  rating_avg: number;
  total_reviews: number;
  profile?: Profile;
}

export interface Booking {
  id: string;
  client_id: string;
  cleaner_id: string;
  service_type: string;
  date: string;
  time: string;
  address: string;
  status: BookingStatus;
  price: number;
  notes: string | null;
  created_at: string;
  cleaner_profile?: CleanerProfile;
  client_profile?: Profile;
}

export interface Review {
  id: string;
  booking_id: string;
  client_id: string;
  cleaner_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  client_profile?: Profile;
}
