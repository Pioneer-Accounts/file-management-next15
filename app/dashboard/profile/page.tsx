"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Loader2,
  User,
  Upload,
  X,
  Shield,
  Mail,
  UserCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

// Custom components instead of shadcn/ui
const CustomButton = ({
  children,
  type = "button",
  className = "",
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <button
    type={type}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      disabled
        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
        : "bg-blue-600 text-white hover:bg-blue-700"
    } ${className}`}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

const CustomInput = ({
  id,
  type = "text",
  value,
  onChange,
  className = "",
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
  />
);

const CustomCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const CustomCardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CustomCardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`px-6 py-4 ${className}`}>{children}</div>;

const CustomCardFooter = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

const CustomTabs = ({
  children,
  activeTab,
  onTabChange,
}: {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => <div className="w-full">{children}</div>;

const CustomTabsList = ({ children }: { children: React.ReactNode }) => (
  <div className="flex border-b border-gray-200 mb-4">{children}</div>
);

const CustomTabTrigger = ({
  value,
  activeTab,
  onClick,
  children,
}: {
  value: string;
  activeTab: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    className={`px-4 py-2 text-sm font-medium ${
      activeTab === value
        ? "border-b-2 border-blue-600 text-blue-600"
        : "text-gray-500 hover:text-gray-700"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const CustomTabContent = ({
  value,
  activeTab,
  children,
}: {
  value: string;
  activeTab: string;
  children: React.ReactNode;
}) => (
  <div className={activeTab === value ? "block" : "hidden"}>{children}</div>
);

const CustomSeparator = () => (
  <div className="h-px w-full bg-gray-200 my-4"></div>
);

const CustomBadge = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

const CustomAlert = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}) => (
  <div
    className={`p-4 rounded-md ${
      variant === "destructive"
        ? "bg-red-50 text-red-700 border border-red-200"
        : "bg-blue-50 text-blue-700 border border-blue-200"
    } ${className}`}
  >
    {children}
  </div>
);

interface UserProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  full_name: string;
  profile_pic: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle profile picture selection
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);

      // Create preview URL and convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected profile picture
  const removeProfilePic = () => {
    setProfilePic(null);
    setPreviewUrl(null);
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        router.push("/signin");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/profiles/me/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setProfile(data);

      // Initialize form fields with current values
      setFirstName(data.user.first_name || "");
      setLastName(data.user.last_name || "");

      // If there's a profile picture, set the preview URL
      if (data.profile_pic) {
        setPreviewUrl(data.profile_pic);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        router.push("/signin");
        return;
      }

      // Create the request payload with base64 image if available
      const userData = {
        user: {
          first_name: firstName,
          last_name: lastName,
        },
        profile_pic: previewUrl || "", // Use the base64 string directly
      };

      // Send the request with JSON payload including base64 image if available
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/profiles/me/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }

      // Refresh profile data
      await fetchUserProfile();
      setSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 font-medium">
          Loading profile information...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
          <p className="text-gray-500 mt-1">
            Manage your account information and preferences
          </p>
        </div>
        <CustomBadge className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200">
          <Shield className="h-4 w-4 mr-1" /> Authenticated User
        </CustomBadge>
      </div>

      {error && (
        <CustomAlert variant="destructive" className="mb-6">
          {error}
        </CustomAlert>
      )}

      {success && (
        <CustomAlert className="mb-6 bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {success}
        </CustomAlert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary Card */}
        <CustomCard className="lg:col-span-1">
          <CustomCardHeader className="pb-4">
            <h2 className="text-xl font-semibold">Account Summary</h2>
            <p className="text-sm text-gray-500 mt-1">
              Your account information
            </p>
          </CustomCardHeader>
          <CustomCardContent className="flex flex-col items-center pt-4 pb-6">
            <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-white shadow-md mb-4">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : profile?.profile_pic ? (
                <Image
                  src={profile.profile_pic}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <UserCircle className="h-20 w-20 text-gray-400" />
              )}
            </div>

            <CustomSeparator />

            <h3 className="text-xl font-semibold text-center">
              {profile?.full_name || `${firstName} ${lastName}`}
            </h3>
            <br></br>
            <div className="flex items-center text-gray-500 mt-1 mb-4">
              <Mail className="h-4 w-4 mr-2" />
              <span>{profile?.user.email}</span>
            </div>

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Last Updated</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </CustomCardContent>
        </CustomCard>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <CustomCard>
            <CustomCardHeader>
              <CustomTabs activeTab={activeTab} onTabChange={setActiveTab}>
                <CustomTabsList>
                  <CustomTabTrigger
                    value="profile"
                    activeTab={activeTab}
                    onClick={() => setActiveTab("profile")}
                  >
                    Profile Information
                  </CustomTabTrigger>
                  <CustomTabTrigger
                    value="security"
                    activeTab={activeTab}
                    onClick={() => setActiveTab("security")}
                  >
                    Security & Access
                  </CustomTabTrigger>
                </CustomTabsList>
              </CustomTabs>
            </CustomCardHeader>

            <CustomCardContent>
              <CustomTabContent value="profile" activeTab={activeTab}>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Personal Information
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Update your personal details and profile picture
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          First Name
                        </label>
                        <CustomInput
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Last Name
                        </label>
                        <CustomInput
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Profile Picture */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Picture
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
                          {previewUrl ? (
                            <Image
                              src={previewUrl}
                              alt="Profile"
                              fill
                              className="object-cover"
                            />
                          ) : profile?.profile_pic ? (
                            <Image
                              src={profile.profile_pic}
                              alt="Profile"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <User className="h-12 w-12 text-gray-400" />
                          )}
                        </div>

                        <div className="flex flex-col space-y-2">
                          <label className="cursor-pointer">
                            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                              <Upload className="h-4 w-4" />
                              <span className="text-sm">
                                Upload new picture
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProfilePicChange}
                            />
                          </label>

                          {previewUrl && (
                            <button
                              type="button"
                              onClick={removeProfilePic}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                            >
                              <X className="h-4 w-4" />
                              <span className="text-sm">Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <CustomSeparator />

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <CustomButton
                      type="submit"
                      className="px-6"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </CustomButton>
                  </div>
                </form>
              </CustomTabContent>

              <CustomTabContent value="security" activeTab={activeTab}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Security Settings
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Manage your account security preferences
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-center">
                      Security settings will be available in a future update.
                    </p>
                  </div>
                </div>
              </CustomTabContent>
            </CustomCardContent>

            <CustomCardFooter className="px-6 py-4">
              <p className="text-xs text-gray-500">
                Last signed in on {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </CustomCardFooter>
          </CustomCard>
        </div>
      </div>
    </div>
  );
}
