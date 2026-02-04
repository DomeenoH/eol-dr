/**
 * PlatformCard Component
 * Visual form card that mimics platform login interfaces with brand colors and icons
 * 
 * Requirements: 9.1
 * 
 * Features:
 * - Platform-specific brand colors and icons
 * - Login interface style layout
 * - Username/email and password input fields
 * - Sensitive field toggle (show/hide password)
 * - Notes field for additional information
 */

import React, { useState, useCallback } from 'react';
import type { PlatformType, PlatformBrand } from '../types/platform';

/**
 * Platform field definition
 */
export interface PlatformField {
  /** Field identifier */
  id: string;
  /** Field label */
  label: string;
  /** Field type */
  type: 'text' | 'email' | 'password' | 'textarea';
  /** Placeholder text */
  placeholder?: string;
  /** Whether this is a sensitive field */
  sensitive?: boolean;
}

/**
 * Platform data structure
 */
export interface PlatformData {
  /** Username or email */
  username?: string;
  /** Password */
  password?: string;
  /** Additional notes */
  notes?: string;
  /** Custom fields */
  [key: string]: string | undefined;
}


/**
 * PlatformCard component props
 */
export interface PlatformCardProps {
  /** Platform type for branding */
  platform: PlatformType;
  /** Custom fields to display (optional, uses defaults if not provided) */
  fields?: PlatformField[];
  /** Current data values */
  data: PlatformData;
  /** Callback when data changes */
  onChange: (data: PlatformData) => void;
  /** Card status indicator */
  status?: 'empty' | 'partial' | 'complete';
  /** Custom class name */
  className?: string;
  /** Whether the card is disabled */
  disabled?: boolean;
}

/**
 * Platform branding configuration
 */
export const platformBranding: Record<PlatformType, PlatformBrand> = {
  discord: {
    name: 'Discord',
    primaryColor: '#5865F2',
    backgroundColor: '#36393f',
    textColor: '#ffffff',
  },
  whatsapp: {
    name: 'WhatsApp',
    primaryColor: '#25D366',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  facebook: {
    name: 'Facebook',
    primaryColor: '#1877F2',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  imessage: {
    name: 'iMessage',
    primaryColor: '#34C759',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  skype: {
    name: 'Skype',
    primaryColor: '#00AFF0',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  google: {
    name: 'Google',
    primaryColor: '#4285F4',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  instagram: {
    name: 'Instagram',
    primaryColor: '#E4405F',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  twitter: {
    name: 'Twitter',
    primaryColor: '#1DA1F2',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  github: {
    name: 'GitHub',
    primaryColor: '#181717',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  linkedin: {
    name: 'LinkedIn',
    primaryColor: '#0A66C2',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  email: {
    name: 'Email',
    primaryColor: '#6B7280',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  bank: {
    name: 'Bank',
    primaryColor: '#059669',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  paypal: {
    name: 'PayPal',
    primaryColor: '#003087',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  crypto: {
    name: 'Crypto',
    primaryColor: '#F7931A',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
};


/**
 * Default fields for platform cards
 */
const defaultFields: PlatformField[] = [
  {
    id: 'username',
    label: 'Email or Username',
    type: 'text',
    placeholder: 'your_username',
  },
  {
    id: 'password',
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    sensitive: true,
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Additional notes (e.g., who should inherit this account)',
  },
];

/**
 * Platform icon component
 */
const PlatformIcon: React.FC<{ platform: PlatformType; className?: string }> = ({
  platform,
  className = '',
}) => {
  const iconPaths: Record<PlatformType, React.ReactNode> = {
    discord: (
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    ),
    whatsapp: (
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    ),
    facebook: (
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    ),
    imessage: (
      <path d="M12 2C6.477 2 2 5.813 2 10.5c0 2.34 1.054 4.47 2.79 6.01-.174.87-.47 2.14-.79 2.99 1.34-.35 2.76-.94 3.79-1.5 1.29.47 2.76.75 4.21.75 5.523 0 10-3.813 10-8.5S17.523 2 12 2z" />
    ),
    skype: (
      <path d="M12.069 18.874c-4.023 0-5.82-1.979-5.82-3.464 0-.765.561-1.296 1.333-1.296 1.723 0 1.273 2.477 4.487 2.477 1.641 0 2.55-.895 2.55-1.811 0-.551-.269-1.16-1.354-1.429l-3.576-.895c-2.88-.724-3.403-2.286-3.403-3.751 0-3.047 2.861-4.191 5.549-4.191 2.471 0 5.393 1.373 5.393 3.199 0 .784-.688 1.24-1.453 1.24-1.469 0-1.198-2.037-4.164-2.037-1.469 0-2.292.664-2.292 1.617s1.153 1.258 2.157 1.487l2.637.587c2.891.649 3.624 2.346 3.624 3.944 0 2.476-1.902 4.324-5.722 4.324m11.084-4.882l-.029.135-.044-.24c.015.045.044.074.059.12.12-.675.181-1.363.181-2.052 0-1.529-.301-3.012-.898-4.42-.569-1.348-1.395-2.562-2.427-3.596-1.049-1.033-2.247-1.856-3.595-2.426-1.318-.631-2.801-.93-4.328-.93-.72 0-1.444.07-2.143.204l.119.06-.239-.033.119-.025C8.91.274 7.829 0 6.731 0c-1.789 0-3.47.698-4.736 1.967C.729 3.235.032 4.923.032 6.716c0 1.143.292 2.265.844 3.258l.02-.124.041.239-.06-.115c-.114.645-.172 1.299-.172 1.955 0 1.53.3 3.017.884 4.416.568 1.362 1.378 2.576 2.427 3.609 1.034 1.05 2.247 1.857 3.595 2.442 1.394.6 2.877.898 4.404.898.659 0 1.334-.06 1.977-.179l-.119-.062.24.046-.135.03c1.002.569 2.126.871 3.294.871 1.783 0 3.459-.69 4.733-1.963 1.259-1.259 1.962-2.951 1.962-4.749 0-1.138-.299-2.262-.853-3.266" />
    ),
    google: (
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    ),
    instagram: (
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    ),
    twitter: (
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    ),
    github: (
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    ),
    linkedin: (
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    ),
    email: (
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    ),
    bank: (
      <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z" />
    ),
    paypal: (
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
    ),
    crypto: (
      <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.52 2.107c-.345-.087-.7-.168-1.05-.25l.53-2.12-1.32-.33-.54 2.16c-.285-.067-.565-.13-.84-.2l-1.815-.45-.35 1.407s.975.225.955.238c.535.136.63.486.615.766l-.617 2.477c.037.01.085.024.14.047l-.14-.036-.865 3.467c-.067.166-.237.415-.62.32.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.254 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.52 2.75 2.084v.006z" />
    ),
  };

  return (
    <svg
      className={`w-6 h-6 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {iconPaths[platform]}
    </svg>
  );
};


/**
 * Eye icon for show/hide toggle
 */
const EyeIcon: React.FC<{ visible: boolean; className?: string }> = ({
  visible,
  className = '',
}) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    {visible ? (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </>
    ) : (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
      </>
    )}
  </svg>
);

/**
 * Status indicator component
 */
const StatusIndicator: React.FC<{ status: 'empty' | 'partial' | 'complete' }> = ({
  status,
}) => {
  const statusConfig = {
    empty: {
      text: '未填写',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-500',
    },
    partial: {
      text: '部分填写',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
    },
    complete: {
      text: '已填写',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}
      data-testid="platform-card-status"
    >
      {config.text}
    </span>
  );
};


/**
 * PlatformCard component
 * Visual form card that mimics platform login interfaces
 */
export const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  fields = defaultFields,
  data,
  onChange,
  status = 'empty',
  className = '',
  disabled = false,
}) => {
  // Track which sensitive fields are visible
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  const branding = platformBranding[platform];

  // Toggle visibility of a sensitive field
  const toggleFieldVisibility = useCallback((fieldId: string) => {
    setVisibleFields((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  }, []);

  // Handle field value change
  const handleFieldChange = useCallback(
    (fieldId: string, value: string) => {
      onChange({
        ...data,
        [fieldId]: value,
      });
    },
    [data, onChange]
  );

  // Determine if the card uses dark theme based on background color
  const isDarkTheme = branding.backgroundColor !== '#ffffff';

  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden ${className}`}
      style={{
        backgroundColor: branding.backgroundColor,
        borderColor: branding.primaryColor,
        borderWidth: '2px',
        borderStyle: 'solid',
      }}
      data-testid="platform-card"
      data-platform={platform}
    >
      {/* Card Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: branding.primaryColor }}
      >
        <div className="flex items-center gap-3">
          <PlatformIcon
            platform={platform}
            className="text-white"
          />
          <span className="font-semibold text-white text-lg">
            {branding.name}
          </span>
        </div>
        <StatusIndicator status={status} />
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-1">
            <label
              htmlFor={`${platform}-${field.id}`}
              className={`block text-sm font-medium ${
                isDarkTheme ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              {field.sensitive && (
                <span className="mr-1" aria-hidden="true">🔒</span>
              )}
              {!field.sensitive && field.type === 'email' && (
                <span className="mr-1" aria-hidden="true">📧</span>
              )}
              {!field.sensitive && field.type === 'text' && field.id === 'username' && (
                <span className="mr-1" aria-hidden="true">👤</span>
              )}
              {field.type === 'textarea' && (
                <span className="mr-1" aria-hidden="true">📝</span>
              )}
              {field.label}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                id={`${platform}-${field.id}`}
                value={data[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                disabled={disabled}
                rows={3}
                className={`
                  w-full px-3 py-2 rounded-md border
                  ${isDarkTheme
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50
                  disabled:opacity-50 disabled:cursor-not-allowed
                  resize-none
                `}
                style={{
                  '--tw-ring-color': branding.primaryColor,
                } as React.CSSProperties}
                data-testid={`platform-field-${field.id}`}
              />
            ) : (
              <div className="relative">
                <input
                  id={`${platform}-${field.id}`}
                  type={
                    field.sensitive && !visibleFields[field.id]
                      ? 'password'
                      : field.type === 'password'
                      ? 'text'
                      : field.type
                  }
                  value={data[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  className={`
                    w-full px-3 py-2 rounded-md border
                    ${isDarkTheme
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${field.sensitive ? 'pr-10' : ''}
                  `}
                  style={{
                    '--tw-ring-color': branding.primaryColor,
                  } as React.CSSProperties}
                  data-testid={`platform-field-${field.id}`}
                />
                {field.sensitive && (
                  <button
                    type="button"
                    onClick={() => toggleFieldVisibility(field.id)}
                    className={`
                      absolute right-2 top-1/2 -translate-y-1/2
                      p-1 rounded
                      ${isDarkTheme
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                      }
                      focus:outline-none focus:ring-2 focus:ring-opacity-50
                    `}
                    style={{
                      '--tw-ring-color': branding.primaryColor,
                    } as React.CSSProperties}
                    aria-label={visibleFields[field.id] ? '隐藏密码' : '显示密码'}
                    data-testid={`toggle-visibility-${field.id}`}
                  >
                    <EyeIcon visible={visibleFields[field.id] || false} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformCard;
