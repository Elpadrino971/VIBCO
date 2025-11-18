import { AuthService } from '../auth.service';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js');

describe('AuthService', () => {
  let authService: AuthService;
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
        getSession: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        updateUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      })),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    authService = new AuthService(mockSupabase);
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
          },
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });

    it('should handle signup error', async () => {
      const mockError = new Error('Email already exists');

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock profile update
      const mockFrom = mockSupabase.from();
      mockFrom.single.mockResolvedValue({ data: null, error: null });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle signin error', async () => {
      const mockError = new Error('Invalid credentials');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'wrong-password',
      });

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signInWithOAuth', () => {
    it('should initiate OAuth flow', async () => {
      const mockUrl = 'https://accounts.google.com/oauth';

      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: mockUrl },
        error: null,
      });

      const result = await authService.signInWithOAuth('google');

      expect(result.url).toEqual(mockUrl);
      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const result = await authService.signOut();

      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('should return null if no user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile', async () => {
      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        plan: 'free',
        projects_limit: 1,
      };

      const mockFrom = mockSupabase.from();
      mockFrom.single.mockResolvedValue({ data: mockProfile, error: null });

      const profile = await authService.getUserProfile('123');

      expect(profile).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  describe('checkProjectQuota', () => {
    it('should check if user can create project', async () => {
      const mockProfile = {
        id: '123',
        projects_limit: 10,
      };

      const mockFrom = mockSupabase.from();
      mockFrom.single.mockResolvedValueOnce({ data: mockProfile, error: null });
      mockFrom.single.mockResolvedValueOnce({ data: null, count: 5, error: null });

      const quota = await authService.checkProjectQuota('123');

      expect(quota.canCreate).toBe(true);
      expect(quota.current).toBe(5);
      expect(quota.limit).toBe(10);
    });

    it('should return false if quota exceeded', async () => {
      const mockProfile = {
        id: '123',
        projects_limit: 1,
      };

      const mockFrom = mockSupabase.from();
      mockFrom.single.mockResolvedValueOnce({ data: mockProfile, error: null });
      mockFrom.single.mockResolvedValueOnce({ data: null, count: 1, error: null });

      const quota = await authService.checkProjectQuota('123');

      expect(quota.canCreate).toBe(false);
      expect(quota.current).toBe(1);
      expect(quota.limit).toBe(1);
    });
  });

  describe('updateUserPlan', () => {
    it('should update user plan with default limits', async () => {
      const mockFrom = mockSupabase.from();
      mockFrom.single.mockResolvedValue({ data: null, error: null });

      const result = await authService.updateUserPlan('123', 'pro');

      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should update user plan with custom limits', async () => {
      const mockFrom = mockSupabase.from();
      mockFrom.single.mockResolvedValue({ data: null, error: null });

      const result = await authService.updateUserPlan('123', 'enterprise', {
        projects_limit: 100,
        ai_generations_limit: null,
      });

      expect(result.error).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      const result = await authService.resetPassword('test@example.com');

      expect(result.error).toBeNull();
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: expect.stringContaining('/auth/reset-password'),
        }
      );
    });
  });
});
