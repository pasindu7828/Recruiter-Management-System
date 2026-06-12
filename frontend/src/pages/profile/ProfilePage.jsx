import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getUserProfile, updateUserProfile } from '../../services/authService';
import Layout from '../../components/layout/Layout';

const brandColor = '#401A94';

const ProfilePageContent = () => {
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    role: '',
    bio: '',
    avatar: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getUserProfile();
      
      if (response) {
        // Extract first and last name from name field
        const nameParts = response.name ? response.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Generate avatar from first and last name initials
        const avatar = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';

        setProfileData({
          name: response.name || '',
          firstName: firstName,
          lastName: lastName,
          email: response.email || '',
          phone: response.phone || '',
          dateOfBirth: response.dateOfBirth || '',
          role: response.role || '',
          bio: response.bio || '',
          avatar: avatar,
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Profile fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (!profileData.firstName || !profileData.lastName || !profileData.email) {
        toast.error('First name, last name, and email are required');
        setIsLoading(false);
        return;
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
        toast.error('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Combine first and last name
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

      // Prepare update data
      const updateData = {
        name: fullName,
        email: profileData.email,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        bio: profileData.bio,
      };

      // Call update API
      const response = await updateUserProfile(updateData);

      if (response) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        
        // Update profile data with response
        const updatedUser = response.user || response;
        const nameParts = updatedUser.name ? updatedUser.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const avatar = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';

        setProfileData({
          name: updatedUser.name || '',
          firstName: firstName,
          lastName: lastName,
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          dateOfBirth: updatedUser.dateOfBirth || '',
          role: updatedUser.role || '',
          bio: updatedUser.bio || '',
          avatar: avatar,
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Refresh profile data to revert changes
    fetchUserProfile();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="w-12 h-12 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50" style={{ paddingLeft: '80px', paddingRight: '80px', paddingTop: '30px', paddingBottom: '30px' }}>
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div
          className="rounded-2xl p-8 text-white mb-8 shadow-lg"
          style={{ backgroundColor: brandColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="flex items-center justify-center w-20 h-20 bg-white/30 rounded-full text-2xl font-bold text-white">
                {profileData.avatar}
              </div>

              {/* Profile Info */}
              <div>
                <h2 className="text-3xl font-bold mb-2">{profileData.name}</h2>
                <div className="flex items-center gap-2 text-white/90 mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>HireHub — {profileData.role}</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{profileData.email}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="border-2 border-gray-300 rounded-2xl p-8 bg-white">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Personal Information</h3>

          <div className="space-y-6">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:border-gray-400"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Date of Birth
              </label>
              <input
                type="text"
                name="dateOfBirth"
                value={profileData.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="MM/DD/YYYY"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:border-gray-400"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:border-gray-400"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Role
              </label>
              <input
                type="text"
                name="role"
                value={profileData.role}
                onChange={handleChange}
                disabled={true}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Bio
              </label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:border-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200 justify-center">
              <button
                onClick={handleSave}
                disabled={isLoading}
                style={{ backgroundColor: '#401A94' }}
                className="px-6 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-2 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProfilePage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <Layout role={user.role || 'candidate'} active="Profile">
      <ProfilePageContent />
    </Layout>
  );
};