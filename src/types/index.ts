import {
  Role,
  UserStatus,
  MenuLocation,
  SettingGroup,
  NotificationType,
  FileType,
  CourseLevel,
  EnrollmentStatus,
  Course,
  Category,
  Chapter,
  Lesson,
  Enrollment,
  LessonProgress,
  Certificate,
} from "@prisma/client";

export type {
  Role,
  UserStatus,
  MenuLocation,
  SettingGroup,
  NotificationType,
  FileType,
  CourseLevel,
  EnrollmentStatus,
  Course,
  Category,
  Chapter,
  Lesson,
  Enrollment,
  LessonProgress,
  Certificate,
};

/**
 * Standard Action Response format for all Server Actions
 */
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  validationErrors?: Record<string, string[]>;
}

/**
 * Safe user representation exposed to client
 */
export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
}

/**
 * Navigation item with typed nested children
 */
export interface NavigationItemWithChildren {
  id: string;
  title: string;
  slugOrUrl: string;
  icon?: string | null;
  badgeText?: string | null;
  location: MenuLocation;
  parentId?: string | null;
  sortOrder: number;
  isExternal: boolean;
  isActive: boolean;
  requiredRole?: Role | null;
  children?: NavigationItemWithChildren[];
}

/**
 * Consolidated Layout Data for DynamicHeader & DynamicFooter
 */
export interface LayoutData {
  settings: Record<string, any>;
  headerMain: NavigationItemWithChildren[];
  headerUtility: NavigationItemWithChildren[];
  footerCol1: NavigationItemWithChildren[];
  footerCol2: NavigationItemWithChildren[];
  footerCol3: NavigationItemWithChildren[];
  footerBottom: NavigationItemWithChildren[];
  currentUser: SafeUser | null;
  unreadNotificationsCount: number;
}

/**
 * Polymorphic Bookmark metadata interface
 */
export interface BookmarkMetadata {
  title: string;
  thumbnail?: string;
  slug?: string;
  subtitle?: string;
  [key: string]: any;
}

/**
 * In-app Notification with user details
 */
export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Storytelling Chapter / Step item
 */
export interface ScrollytellingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag?: string;
  imageUrl?: string;
  actionText?: string;
  actionUrl?: string;
}
