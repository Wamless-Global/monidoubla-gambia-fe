'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface GeneralSettings {
	platformName: string;
	platformCurrency: string;
	country: string;
	autoMatching: boolean;
	commissionRate: number;
	maintenanceMode: boolean;
	maintenanceMessage: string;
}

interface NotificationSettings {
	smsProvider: string;
	smsApiKey: string;
	smsApiSecret: string;
	smsSenderId: string;
	emailHost: string;
	emailPort: number;
	emailUser: string;
	emailPassword: string;
	emailFromName: string;
}

interface SystemSettings {
	maxTransactionAmount: number;
	minTransactionAmount: number;
	sessionTimeout: number;
	backupFrequency: string;
	enableTwoFA: boolean;
	requireEmailVerification: boolean;
	maxLoginAttempts: number;
}

interface SecuritySettings {
	allowLogin: boolean;
	allowAccountCreation: boolean;
	enableGoogleAuth: boolean;
	enableFacebookAuth: boolean;
	enableTwitterAuth: boolean;
	enableAppleAuth: boolean;
	enableGithubAuth: boolean;
}

function parseSettings(settingsArr: { setting_key: string; setting_value: string }[], defaults: Record<string, any>) {
	const result: Record<string, any> = { ...defaults };
	for (const { setting_key, setting_value } of settingsArr) {
		if (setting_value === 'true' || setting_value === 'false') {
			result[setting_key] = setting_value === 'true';
		} else if (!isNaN(Number(setting_value)) && setting_value.trim() !== '') {
			result[setting_key] = Number(setting_value);
		} else {
			result[setting_key] = setting_value;
		}
	}
	return result;
}

export default function SettingsPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [saving, setSaving] = useState<string | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
		platformName: '',
		platformCurrency: '',
		country: '',
		autoMatching: false,
		commissionRate: 0,
		maintenanceMode: false,
		maintenanceMessage: '',
	});

	const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
		smsProvider: 'twilio',
		smsApiKey: '',
		smsApiSecret: '',
		smsSenderId: '',
		emailHost: '',
		emailPort: 0,
		emailUser: '',
		emailPassword: '',
		emailFromName: '',
	});

	const [systemSettings, setSystemSettings] = useState<SystemSettings>({
		maxTransactionAmount: 0,
		minTransactionAmount: 0,
		sessionTimeout: 0,
		backupFrequency: '',
		enableTwoFA: false,
		requireEmailVerification: false,
		maxLoginAttempts: 0,
	});

	const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
		allowLogin: false,
		allowAccountCreation: false,
		enableGoogleAuth: false,
		enableFacebookAuth: false,
		enableTwitterAuth: false,
		enableAppleAuth: false,
		enableGithubAuth: false,
	});

	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	useEffect(() => {
		setIsMounted(true);
		loadSettings();
	}, []);

	const loadSettings = async () => {
		setIsLoading(true);
		try {
			const res = await fetchWithAuth('/api/admin/settings');
			if (!res.ok) throw new Error('Failed to fetch settings');
			const data = await res.json();

			if (data?.data?.settings) {
				setGeneralSettings((prev) => ({
					...prev,
					...parseSettings(data.data.settings, prev),
				}));
				setNotificationSettings((prev) => ({
					...prev,
					...parseSettings(data.data.settings, prev),
				}));
				setSystemSettings((prev) => ({
					...prev,
					...parseSettings(data.data.settings, prev),
				}));
				setSecuritySettings((prev) => ({
					...prev,
					...parseSettings(data.data.settings, prev),
				}));
			}
		} catch (error) {
			toast.error('Failed to load settings.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/svg+xml')) {
			setGeneralSettings((prev) => ({ ...prev, logoFile: file, logoUrl: URL.createObjectURL(file) }));
		} else if (file) {
			toast.error('Please select a valid image file (JPEG, PNG, or SVG)');
		}
	};

	const validateGeneralSettings = (): boolean => {
		const newErrors: { [key: string]: string } = {};

		if (!generalSettings.platformName.trim()) {
			newErrors.platformName = 'Platform name is required';
		} else if (generalSettings.platformName.length < 2) {
			newErrors.platformName = 'Platform name must be at least 2 characters';
		}

		if (!generalSettings.platformCurrency.trim()) {
			newErrors.platformCurrency = 'Platform currency is required';
		}

		if (generalSettings.commissionRate < 0 || generalSettings.commissionRate > 100) {
			newErrors.commissionRate = 'Commission rate must be between 0-100';
		}

		if (generalSettings.maintenanceMode && !generalSettings.maintenanceMessage.trim()) {
			newErrors.maintenanceMessage = 'Maintenance message is required when maintenance mode is enabled';
		}

		setErrors((prev) => ({ ...prev, ...newErrors }));
		return Object.keys(newErrors).length === 0;
	};

	const validateNotificationSettings = (): boolean => {
		const newErrors: { [key: string]: string } = {};

		if (notificationSettings.smsApiKey && !notificationSettings.smsApiSecret) {
			newErrors.smsApiSecret = 'SMS API key and secret must be filled together';
		}

		if (notificationSettings.emailHost && !notificationSettings.emailUser) {
			newErrors.emailUser = 'Email user is required when email host is configured';
		}

		if (notificationSettings.emailPort < 1 || notificationSettings.emailPort > 65535) {
			newErrors.emailPort = 'Email port must be between 1-65535';
		}

		setErrors((prev) => ({ ...prev, ...newErrors }));
		return Object.keys(newErrors).length === 0;
	};

	const validateSystemSettings = (): boolean => {
		const newErrors: { [key: string]: string } = {};

		if (systemSettings.maxTransactionAmount <= systemSettings.minTransactionAmount) {
			newErrors.maxTransactionAmount = 'Maximum transaction amount must be greater than minimum';
		}

		if (systemSettings.minTransactionAmount < 1) {
			newErrors.minTransactionAmount = 'Minimum transaction amount must be greater than 0';
		}

		if (systemSettings.sessionTimeout < 5 || systemSettings.sessionTimeout > 480) {
			newErrors.sessionTimeout = 'Session timeout must be between 5-480 minutes';
		}

		if (systemSettings.maxLoginAttempts < 1 || systemSettings.maxLoginAttempts > 20) {
			newErrors.maxLoginAttempts = 'Maximum login attempts must be between 1-20';
		}

		setErrors((prev) => ({ ...prev, ...newErrors }));
		return Object.keys(newErrors).length === 0;
	};

	const objectToUpdates = (obj: Record<string, any>) =>
		Object.entries(obj)
			.filter(([key, value]) => key !== 'logoFile' && key !== 'smsSenderId' && value !== '' && value !== null && value !== undefined)
			.map(([key, value]) => ({
				key,
				setting_value: typeof value === 'string' ? value : JSON.stringify(value),
			}));

	const handleSaveGeneralSettings = async () => {
		if (!validateGeneralSettings()) return;
		setSaving('general');
		try {
			const updates = objectToUpdates(generalSettings);
			logger.log({ updates });
			const res = await fetchWithAuth('/api/admin/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ updates }),
			});
			if (!res.ok) throw new Error('Failed to save settings');
			toast.success('General settings saved successfully');
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors.platformName;
				delete newErrors.platformCurrency;
				delete newErrors.commissionRate;
				delete newErrors.maintenanceMessage;
				delete newErrors.logoUrl;
				return newErrors;
			});
		} catch (error) {
			toast.error('Failed to save settings. Please try again.');
		} finally {
			setSaving(null);
		}
	};

	const handleSaveNotificationSettings = async () => {
		if (!validateNotificationSettings()) return;
		setSaving('notification');
		try {
			const updates = objectToUpdates(notificationSettings);
			const res = await fetchWithAuth('/api/admin/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ updates }),
			});
			if (!res.ok) throw new Error('Failed to save settings');
			toast.success('Notification settings saved successfully');
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors.smsApiSecret;
				delete newErrors.emailUser;
				delete newErrors.emailPort;
				return newErrors;
			});
		} catch (error) {
			toast.error('Failed to save settings. Please try again.');
		} finally {
			setSaving(null);
		}
	};

	const handleSaveSystemSettings = async () => {
		if (!validateSystemSettings()) return;
		setSaving('system');
		try {
			const updates = objectToUpdates(systemSettings);
			const res = await fetchWithAuth('/api/admin/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ updates }),
			});
			if (!res.ok) throw new Error('Failed to save settings');
			toast.success('System settings saved successfully');
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors.maxTransactionAmount;
				delete newErrors.minTransactionAmount;
				delete newErrors.sessionTimeout;
				delete newErrors.maxLoginAttempts;
				return newErrors;
			});
		} catch (error) {
			toast.error('Failed to save settings. Please try again.');
		} finally {
			setSaving(null);
		}
	};

	const handleSaveSecuritySettings = async () => {
		setSaving('security');
		try {
			const updates = objectToUpdates(securitySettings);
			const res = await fetchWithAuth('/api/admin/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ updates }),
			});
			if (!res.ok) throw new Error('Failed to save settings');
			toast.success('Security settings saved successfully');
		} catch (error) {
			toast.error('Failed to save settings. Please try again.');
		} finally {
			setSaving(null);
		}
	};

	if (!isMounted || isLoading) {
		return (
			<div className="p-6 space-y-6  min-h-screen">
				{/* Header */}
				<div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>

				{/* General Settings Card */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<div className="space-y-6">
						<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40 animate-pulse"></div>

						{/* Platform Name */}
						<div className="space-y-2">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>

						{/* Country */}
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
							<input
								type="text"
								value={generalSettings.country}
								onChange={(e) => setGeneralSettings((prev) => ({ ...prev, country: e.target.value }))}
								placeholder="Enter country"
								className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
							/>
						</div>
						<div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
					</div>
				</div>

				{/* Notification Settings Card */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<div className="space-y-6">
						<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-44 animate-pulse"></div>

						{/* SMS Settings */}
						<div className="space-y-4">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28 animate-pulse"></div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
								<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
							</div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
								<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
							</div>
						</div>

						{/* Email Settings */}
						<div className="space-y-4">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28 animate-pulse"></div>
								<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
							</div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
								<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
							</div>
						</div>

						{/* Save Button */}
						<div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
					</div>
				</div>

				{/* System Settings Card */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<div className="space-y-6">
						<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-36 animate-pulse"></div>

						{/* Max Transaction Amount */}
						<div className="space-y-2">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-44 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>

						{/* Min Transaction Amount */}
						<div className="space-y-2">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-44 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>

						{/* Session Timeout */}
						<div className="space-y-2">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>

						{/* Backup Frequency */}
						<div className="space-y-2">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>

						{/* Save Button */}
						<div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6  min-h-screen" suppressHydrationWarning={true}>
			{/* Header */}
			<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

			{/* General Settings */}
			<Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
				<div className="space-y-6">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h2>

					{/* Platform Name */}
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Platform Name</label>
						<input
							type="text"
							value={generalSettings.platformName}
							onChange={(e) => setGeneralSettings((prev) => ({ ...prev, platformName: e.target.value }))}
							placeholder="Enter platform name"
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
								errors.platformName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
							}`}
						/>
						{errors.platformName && <p className="text-sm text-red-600 dark:text-red-400">{errors.platformName}</p>}
					</div>

					{/* Platform Currency */}
					{/* <div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Platform Currency</label>
						<select
							value={generalSettings.platformCurrency}
							onChange={(e) => setGeneralSettings((prev) => ({ ...prev, platformCurrency: e.target.value }))}
							className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
								errors.platformCurrency ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
							}`}
						>
							<option value={getCurrencyFromLocalStorage().code}>{getCurrencyFromLocalStorage().code} (Ghana Cedis)</option>
							<option value="USD">USD (US Dollar)</option>
							<option value="EUR">EUR (Euro)</option>
							<option value="NGN">NGN (Nigerian Naira)</option>
						</select>
						{errors.platformCurrency && <p className="text-sm text-red-600 dark:text-red-400">{errors.platformCurrency}</p>}
					</div> */}

					{/* Auto Matching */}
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Auto Matching</label>
						<button
							onClick={() => setGeneralSettings((prev) => ({ ...prev, autoMatching: !prev.autoMatching }))}
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${generalSettings.autoMatching ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
						>
							<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${generalSettings.autoMatching ? 'translate-x-6' : 'translate-x-1'}`} />
						</button>
						<p className="text-sm text-gray-500 dark:text-gray-400">Enable automatic matching of PH and GH requests</p>
					</div>

					{/* Commission Rate */}
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Commission Rate (%)</label>
						<input
							type="number"
							min="0"
							max="100"
							step="0.1"
							value={generalSettings.commissionRate}
							onChange={(e) => setGeneralSettings((prev) => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
							placeholder="Enter commission rate"
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
								errors.commissionRate ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
							}`}
						/>
						{errors.commissionRate && <p className="text-sm text-red-600 dark:text-red-400">{errors.commissionRate}</p>}
					</div>

					{/* Maintenance Mode */}
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Mode</label>
						<button
							onClick={() => setGeneralSettings((prev) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${generalSettings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}
						>
							<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${generalSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
						</button>
						{generalSettings.maintenanceMode && (
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Message</label>
								<textarea
									value={generalSettings.maintenanceMessage}
									onChange={(e) => setGeneralSettings((prev) => ({ ...prev, maintenanceMessage: e.target.value }))}
									placeholder="Enter maintenance message"
									rows={3}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none ${
										errors.maintenanceMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
									}`}
								/>
								{errors.maintenanceMessage && <p className="text-sm text-red-600 dark:text-red-400">{errors.maintenanceMessage}</p>}
							</div>
						)}
					</div>

					<Button onClick={handleSaveGeneralSettings} disabled={saving === 'general'} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
						{saving === 'general' ? (
							<>
								<i className="ri-loader-4-line animate-spin w-4 h-4 flex items-center justify-center mr-2"></i>
								Saving...
							</>
						) : (
							'Save Settings'
						)}
					</Button>
				</div>
			</Card>

			{/* Security & Authentication Settings */}
			<Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
				<div className="space-y-6">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security & Authentication</h2>

					{/* Account Creation & Login */}
					<div className="space-y-4">
						<h3 className="text-md font-medium text-gray-900 dark:text-white">Account Management</h3>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow User Login</label>
									<p className="text-sm text-gray-500 dark:text-gray-400">Allow users to log in to their accounts</p>
								</div>
								<button
									onClick={() => setSecuritySettings((prev) => ({ ...prev, allowLogin: !prev.allowLogin }))}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${securitySettings.allowLogin ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
								>
									<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.allowLogin ? 'translate-x-6' : 'translate-x-1'}`} />
								</button>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Account Creation</label>
									<p className="text-sm text-gray-500 dark:text-gray-400">Allow new users to create accounts</p>
								</div>
								<button
									onClick={() => setSecuritySettings((prev) => ({ ...prev, allowAccountCreation: !prev.allowAccountCreation }))}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${securitySettings.allowAccountCreation ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
								>
									<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.allowAccountCreation ? 'translate-x-6' : 'translate-x-1'}`} />
								</button>
							</div>
						</div>
					</div>

					{/* Social Login Providers */}
					{/* <div className="space-y-4">
						<h3 className="text-md font-medium text-gray-900 dark:text-white">Social Login Providers</h3>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Authentication</label>
									<p className="text-sm text-gray-500 dark:text-gray-400">Allow users to sign in with Google</p>
								</div>
								<button
									onClick={() => setSecuritySettings((prev) => ({ ...prev, enableGoogleAuth: !prev.enableGoogleAuth }))}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${securitySettings.enableGoogleAuth ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
								>
									<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.enableGoogleAuth ? 'translate-x-6' : 'translate-x-1'}`} />
								</button>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook Authentication</label>
									<p className="text-sm text-gray-500 dark:text-gray-400">Allow users to sign in with Facebook</p>
								</div>
								<button
									onClick={() => setSecuritySettings((prev) => ({ ...prev, enableFacebookAuth: !prev.enableFacebookAuth }))}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${securitySettings.enableFacebookAuth ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
								>
									<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.enableFacebookAuth ? 'translate-x-6' : 'translate-x-1'}`} />
								</button>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter Authentication</label>
									<p className="text-sm text-gray-500 dark:text-gray-400">Allow users to sign in with Twitter</p>
								</div>
								<button
									onClick={() => setSecuritySettings((prev) => ({ ...prev, enableTwitterAuth: !prev.enableTwitterAuth }))}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${securitySettings.enableTwitterAuth ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
								>
									<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.enableTwitterAuth ? 'translate-x-6' : 'translate-x-1'}`} />
								</button>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Apple Authentication</label>
									<p className="text-sm text-gray-500 dark:text-gray-400">Allow users to sign in with Apple</p>
								</div>
								<button
									onClick={() => setSecuritySettings((prev) => ({ ...prev, enableAppleAuth: !prev.enableAppleAuth }))}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${securitySettings.enableAppleAuth ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
								>
									<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.enableAppleAuth ? 'translate-x-6' : 'translate-x-1'}`} />
								</button>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub Authentication</label>
									<p className="text-sm text-gray-500 dark:text-gray-400">Allow users to sign in with GitHub</p>
								</div>
								<button
									onClick={() => setSecuritySettings((prev) => ({ ...prev, enableGithubAuth: !prev.enableGithubAuth }))}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${securitySettings.enableGithubAuth ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
								>
									<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.enableGithubAuth ? 'translate-x-6' : 'translate-x-1'}`} />
								</button>
							</div>
						</div>
					</div> */}

					<Button onClick={handleSaveSecuritySettings} disabled={saving === 'security'} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
						{saving === 'security' ? (
							<>
								<i className="ri-loader-4-line animate-spin w-4 h-4 flex items-center justify-center mr-2"></i>
								Saving...
							</>
						) : (
							'Save Security Settings'
						)}
					</Button>
				</div>
			</Card>

			{/* Notification Settings */}
			<Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
				<div className="space-y-6">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h2>

					{/* SMS Settings */}
					<div className="space-y-4">
						<h3 className="text-md font-medium text-gray-900 dark:text-white">SMS Settings</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sender ID</label>
								<input
									type="text"
									value={notificationSettings.smsSenderId}
									disabled
									placeholder="Sender ID is disabled"
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 placeholder-gray-400 cursor-not-allowed"
								/>
							</div>

							{/* SMS Provider Dropdown */}
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SMS Provider</label>
								<select
									value={notificationSettings.smsProvider}
									onChange={(e) => setNotificationSettings((prev) => ({ ...prev, smsProvider: e.target.value }))}
									className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								>
									<option value="TwilioSmsProvider">Twilio</option>
									<option value="termii">Termii</option>
								</select>
							</div>
						</div>
					</div>

					{/* Email Settings */}
					<div className="space-y-4">
						<h3 className="text-md font-medium text-gray-900 dark:text-white">Email Settings</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Host</label>
								<input
									type="text"
									value={notificationSettings.emailHost}
									onChange={(e) => setNotificationSettings((prev) => ({ ...prev, emailHost: e.target.value }))}
									placeholder="Enter SMTP host"
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
								/>
							</div>

							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Port</label>
								<input
									type="number"
									min="1"
									max="65535"
									value={notificationSettings.emailPort}
									onChange={(e) => setNotificationSettings((prev) => ({ ...prev, emailPort: parseInt(e.target.value) || 587 }))}
									placeholder="Enter SMTP port"
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
										errors.emailPort ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
									}`}
								/>
								{errors.emailPort && <p className="text-sm text-red-600 dark:text-red-400">{errors.emailPort}</p>}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Username</label>
								<input
									type="email"
									value={notificationSettings.emailUser}
									onChange={(e) => setNotificationSettings((prev) => ({ ...prev, emailUser: e.target.value }))}
									placeholder="Enter email username"
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
										errors.emailUser ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
									}`}
								/>
								{errors.emailUser && <p className="text-sm text-red-600 dark:text-red-400">{errors.emailUser}</p>}
							</div>

							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Password</label>
								<input
									type="password"
									value={notificationSettings.emailPassword}
									onChange={(e) => setNotificationSettings((prev) => ({ ...prev, emailPassword: e.target.value }))}
									placeholder="Enter email password"
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Name</label>
							<input
								type="text"
								value={notificationSettings.emailFromName}
								onChange={(e) => setNotificationSettings((prev) => ({ ...prev, emailFromName: e.target.value }))}
								placeholder="Enter from name"
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
							/>
						</div>
					</div>

					<Button onClick={handleSaveNotificationSettings} disabled={saving === 'notification'} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
						{saving === 'notification' ? (
							<>
								<i className="ri-loader-4-line animate-spin w-4 h-4 flex items-center justify-center mr-2"></i>
								Saving...
							</>
						) : (
							'Save Settings'
						)}
					</Button>
				</div>
			</Card>

			{/* System Settings */}
			<Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
				<div className="space-y-6">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Settings</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Session Timeout (minutes)</label>
							<input
								type="number"
								min="5"
								max="480"
								value={systemSettings.sessionTimeout}
								onChange={(e) => setSystemSettings((prev) => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 60 }))}
								placeholder="Enter session timeout"
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
									errors.sessionTimeout ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
								}`}
							/>
							{errors.sessionTimeout && <p className="text-sm text-red-600 dark:text-red-400">{errors.sessionTimeout}</p>}
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Backup Frequency</label>
							<select
								value={systemSettings.backupFrequency}
								onChange={(e) => setSystemSettings((prev) => ({ ...prev, backupFrequency: e.target.value }))}
								className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
							>
								<option value="hourly">Hourly</option>
								<option value="daily">Daily</option>
								<option value="weekly">Weekly</option>
								<option value="monthly">Monthly</option>
							</select>
						</div>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Login Attempts</label>
						<input
							type="number"
							min="1"
							max="20"
							value={systemSettings.maxLoginAttempts}
							onChange={(e) => setSystemSettings((prev) => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 5 }))}
							placeholder="Enter maximum login attempts"
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
								errors.maxLoginAttempts ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
							}`}
						/>
						{errors.maxLoginAttempts && <p className="text-sm text-red-600 dark:text-red-400">{errors.maxLoginAttempts}</p>}
					</div>

					{/* Security Settings */}
					<div className="space-y-4">
						<h3 className="text-md font-medium text-gray-900 dark:text-white">Security Settings</h3>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Two-Factor Authentication</label>
									<p className="text-sm text-gray-500 dark:text-gray-400">Enable two-factor authentication for admin accounts</p>
								</div>
								<button
									onClick={() => setSystemSettings((prev) => ({ ...prev, enableTwoFA: !prev.enableTwoFA }))}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${systemSettings.enableTwoFA ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
								>
									<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.enableTwoFA ? 'translate-x-6' : 'translate-x-1'}`} />
								</button>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Email Verification</label>
									<p className="text-sm text-gray-500 dark:text-gray-400">Users must verify their email after registration</p>
								</div>
								<button
									onClick={() => setSystemSettings((prev) => ({ ...prev, requireEmailVerification: !prev.requireEmailVerification }))}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${systemSettings.requireEmailVerification ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
								>
									<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'}`} />
								</button>
							</div>
						</div>
					</div>

					<Button onClick={handleSaveSystemSettings} disabled={saving === 'system'} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
						{saving === 'system' ? (
							<>
								<i className="ri-loader-4-line animate-spin w-4 h-4 flex items-center justify-center mr-2"></i>
								Saving...
							</>
						) : (
							'Save Settings'
						)}
					</Button>
				</div>
			</Card>
		</div>
	);
}
