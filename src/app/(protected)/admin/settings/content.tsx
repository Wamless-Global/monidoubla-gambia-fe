'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
interface GeneralSettings {
	platformName: string;
	platformCurrency: string;
	country: string;
	autoMatching: boolean;
	commissionRate: string;
	maintenanceMode: boolean;
	maintenanceMessage: string;
	referralGeneration?: string;
	referralBonusWithdrawableAmount?: number;
	referralBonusReleaseType?: 'completed' | 'matured';
	platform_base_currency?: string;
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

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
	<button
		type="button"
		onClick={onChange}
		className={cn('relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2', enabled ? 'bg-indigo-600' : 'bg-slate-200')}
		aria-pressed={enabled}
	>
		<span className={cn('pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out', enabled ? 'translate-x-5' : 'translate-x-0')} />
	</button>
);

export default function SettingsPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [saving, setSaving] = useState<string | null>(null);
	const [activeSection, setActiveSection] = useState('general');
	const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
		platformName: '',
		platformCurrency: '',
		platform_base_currency: '',
		country: '',
		autoMatching: false,
		commissionRate: '',
		maintenanceMode: false,
		maintenanceMessage: '',
		referralGeneration: '',
		referralBonusWithdrawableAmount: 0,
		referralBonusReleaseType: 'completed',
	});
	const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ smsProvider: 'twilio', smsApiKey: '', smsApiSecret: '', smsSenderId: '', emailHost: '', emailPort: 0, emailUser: '', emailPassword: '', emailFromName: '' });
	const [systemSettings, setSystemSettings] = useState<SystemSettings>({ maxTransactionAmount: 0, minTransactionAmount: 0, sessionTimeout: 0, backupFrequency: '', enableTwoFA: false, requireEmailVerification: false, maxLoginAttempts: 0 });
	const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({ allowLogin: false, allowAccountCreation: false, enableGoogleAuth: false, enableFacebookAuth: false, enableTwitterAuth: false, enableAppleAuth: false, enableGithubAuth: false });
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		setIsLoading(true);
		try {
			const res = await fetchWithAuth('/api/admin/settings');
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch settings'));
			const data = await res.json();
			if (data?.data?.settings) {
				setGeneralSettings((prev) => ({ ...prev, ...parseSettings(data.data.settings, prev) }));
				setNotificationSettings((prev) => ({ ...prev, ...parseSettings(data.data.settings, prev) }));
				setSystemSettings((prev) => ({ ...prev, ...parseSettings(data.data.settings, prev) }));
				setSecuritySettings((prev) => ({ ...prev, ...parseSettings(data.data.settings, prev) }));
			}
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to load settings.'));
		} finally {
			setIsLoading(false);
		}
	};

	const validateGeneralSettings = (): boolean => {
		const newErrors: { [key: string]: string } = {};
		if (!generalSettings.platformName.trim() || generalSettings.platformName.length < 2) newErrors.platformName = 'Platform name must be at least 2 characters';
		if (!generalSettings.platformCurrency.trim()) newErrors.platformCurrency = 'Platform currency is required';
		if (generalSettings.maintenanceMode && !generalSettings.maintenanceMessage.trim()) newErrors.maintenanceMessage = 'Maintenance message is required when enabled';
		setErrors((prev) => ({ ...prev, ...newErrors }));
		return Object.keys(newErrors).length === 0;
	};

	const validateNotificationSettings = (): boolean => {
		const newErrors: { [key: string]: string } = {};
		if (notificationSettings.smsApiKey && !notificationSettings.smsApiSecret) newErrors.smsApiSecret = 'SMS API key and secret must be filled together';
		if (notificationSettings.emailHost && !notificationSettings.emailUser) newErrors.emailUser = 'Email user is required when email host is configured';
		if (notificationSettings.emailPort < 1 || notificationSettings.emailPort > 65535) newErrors.emailPort = 'Email port must be between 1-65535';
		setErrors((prev) => ({ ...prev, ...newErrors }));
		return Object.keys(newErrors).length === 0;
	};

	const validateSystemSettings = (): boolean => {
		const newErrors: { [key: string]: string } = {};
		if (systemSettings.maxTransactionAmount <= systemSettings.minTransactionAmount) newErrors.maxTransactionAmount = 'Maximum must be greater than minimum';
		if (systemSettings.minTransactionAmount < 1) newErrors.minTransactionAmount = 'Minimum must be greater than 0';
		if (systemSettings.sessionTimeout < 5 || systemSettings.sessionTimeout > 480) newErrors.sessionTimeout = 'Must be between 5-480 minutes';
		if (systemSettings.maxLoginAttempts < 1 || systemSettings.maxLoginAttempts > 20) newErrors.maxLoginAttempts = 'Must be between 1-20';
		setErrors((prev) => ({ ...prev, ...newErrors }));
		return Object.keys(newErrors).length === 0;
	};

	const objectToUpdates = (obj: Record<string, any>) =>
		Object.entries(obj)
			.filter(([key]) => key !== 'logoFile')
			.map(([key, value]) => ({ key, setting_value: String(value) }));

	const handleSaveSettings = async (section: string, settingsData: any, validator?: () => boolean) => {
		if (validator && !validator()) {
			toast.error('Please fix the errors before saving.');
			return;
		}
		setSaving(section);
		try {
			const updates = objectToUpdates(settingsData);
			const res = await fetchWithAuth('/api/admin/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ updates }),
			});
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to save settings'));
			toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to save settings. Please try again.'));
		} finally {
			setSaving(null);
		}
	};

	if (isLoading) {
		return <div>Loading Settings...</div>;
	}

	return (
		<div className="space-y-6">
			<header>
				<h1 className="text-3xl font-bold text-slate-800">Settings</h1>
				<p className="text-slate-500 mt-1">Manage your platform's configuration and security.</p>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				<nav className="lg:col-span-1 lg:sticky top-24 self-start">
					<ul className="space-y-1">
						<li>
							<a href="#general" onClick={() => setActiveSection('general')} className={cn('block px-4 py-2 rounded-md text-sm font-medium', activeSection === 'general' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100')}>
								General
							</a>
						</li>
						<li>
							<a href="#security" onClick={() => setActiveSection('security')} className={cn('block px-4 py-2 rounded-md text-sm font-medium', activeSection === 'security' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100')}>
								Security & Auth
							</a>
						</li>
						<li>
							<a href="#notifications" onClick={() => setActiveSection('notifications')} className={cn('block px-4 py-2 rounded-md text-sm font-medium', activeSection === 'notifications' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100')}>
								Notifications
							</a>
						</li>
						<li>
							<a href="#system" onClick={() => setActiveSection('system')} className={cn('block px-4 py-2 rounded-md text-sm font-medium', activeSection === 'system' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100')}>
								System
							</a>
						</li>
					</ul>
				</nav>

				<div className="lg:col-span-3 space-y-8">
					<Card id="general">
						<CardHeader>
							<CardTitle>General Settings</CardTitle>
							<CardDescription>Configure basic platform information.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label>Platform Name</label>
								<input type="text" value={generalSettings.platformName} onChange={(e) => setGeneralSettings((prev) => ({ ...prev, platformName: e.target.value }))} placeholder="Enter platform name" />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label>Platform Base Currency</label>
									<input type="text" value={generalSettings.platform_base_currency ?? ''} onChange={(e) => setGeneralSettings((prev) => ({ ...prev, platform_base_currency: e.target.value }))} placeholder="e.g. USD" />
								</div>
								<div>
									<label>Country</label>
									<input type="text" value={generalSettings.country} onChange={(e) => setGeneralSettings((prev) => ({ ...prev, country: e.target.value }))} placeholder="Enter country" />
								</div>
							</div>
							<div className="pt-4 border-t">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">Maintenance Mode</h4>
										<p className="text-sm text-slate-500">Temporarily disable access to the user-facing site.</p>
									</div>
									<ToggleSwitch enabled={generalSettings.maintenanceMode} onChange={() => setGeneralSettings((prev) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))} />
								</div>
								{generalSettings.maintenanceMode && (
									<div className="mt-4">
										<label>Maintenance Message</label>
										<textarea value={generalSettings.maintenanceMessage} onChange={(e) => setGeneralSettings((prev) => ({ ...prev, maintenanceMessage: e.target.value }))} placeholder="Site is down for maintenance..." rows={3} />
									</div>
								)}
							</div>
						</CardContent>
						<CardFooter>
							<Button onClick={() => handleSaveSettings('general', generalSettings, validateGeneralSettings)} disabled={saving === 'general'}>
								{saving === 'general' ? 'Saving...' : 'Save General Settings'}
							</Button>
						</CardFooter>
					</Card>

					<Card id="security">
						<CardHeader>
							<CardTitle>Security & Authentication</CardTitle>
							<CardDescription>Manage how users can log in and register.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 divide-y divide-slate-200">
							<div className="flex items-center justify-between pt-4 first:pt-0">
								<div>
									<h4 className="font-medium text-slate-800">Allow User Login</h4>
									<p className="text-sm text-slate-500">Enable or disable user login globally.</p>
								</div>
								<ToggleSwitch enabled={securitySettings.allowLogin} onChange={() => setSecuritySettings((prev) => ({ ...prev, allowLogin: !prev.allowLogin }))} />
							</div>
							<div className="flex items-center justify-between pt-4">
								<div>
									<h4 className="font-medium text-slate-800">Allow Account Creation</h4>
									<p className="text-sm text-slate-500">Enable or disable new user registrations.</p>
								</div>
								<ToggleSwitch enabled={securitySettings.allowAccountCreation} onChange={() => setSecuritySettings((prev) => ({ ...prev, allowAccountCreation: !prev.allowAccountCreation }))} />
							</div>
						</CardContent>
						<CardFooter>
							<Button onClick={() => handleSaveSettings('security', securitySettings)} disabled={saving === 'security'}>
								{saving === 'security' ? 'Saving...' : 'Save Security Settings'}
							</Button>
						</CardFooter>
					</Card>

					<Card id="notifications">
						<CardHeader>
							<CardTitle>Notification Settings</CardTitle>
							<CardDescription>Configure email and SMS providers.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<h4 className="font-medium text-slate-800">Email Settings</h4>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label>SMTP Host</label>
									<input type="text" value={notificationSettings.emailHost} onChange={(e) => setNotificationSettings((prev) => ({ ...prev, emailHost: e.target.value }))} placeholder="e.g. smtp.mailgun.org" />
								</div>
								<div>
									<label>SMTP Port</label>
									<input type="number" value={notificationSettings.emailPort} onChange={(e) => setNotificationSettings((prev) => ({ ...prev, emailPort: parseInt(e.target.value) || 587 }))} placeholder="e.g. 587" />
								</div>
								<div>
									<label>Email Username</label>
									<input type="email" value={notificationSettings.emailUser} onChange={(e) => setNotificationSettings((prev) => ({ ...prev, emailUser: e.target.value }))} placeholder="Your email username" />
								</div>
								<div>
									<label>Email Password</label>
									<input type="password" value={notificationSettings.emailPassword} onChange={(e) => setNotificationSettings((prev) => ({ ...prev, emailPassword: e.target.value }))} placeholder="Your email password" />
								</div>
								<div className="sm:col-span-2">
									<label>From Name</label>
									<input type="text" value={notificationSettings.emailFromName} onChange={(e) => setNotificationSettings((prev) => ({ ...prev, emailFromName: e.target.value }))} placeholder="e.g. Acme Inc." />
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button onClick={() => handleSaveSettings('notification', notificationSettings, validateNotificationSettings)} disabled={saving === 'notification'}>
								{saving === 'notification' ? 'Saving...' : 'Save Notification Settings'}
							</Button>
						</CardFooter>
					</Card>

					<Card id="system">
						<CardHeader>
							<CardTitle>System Settings</CardTitle>
							<CardDescription>Advanced platform-wide configurations.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label>Min Transaction Amount</label>
									<input type="number" value={systemSettings.minTransactionAmount} onChange={(e) => setSystemSettings((prev) => ({ ...prev, minTransactionAmount: Number(e.target.value) }))} />
								</div>
								<div>
									<label>Max Transaction Amount</label>
									<input type="number" value={systemSettings.maxTransactionAmount} onChange={(e) => setSystemSettings((prev) => ({ ...prev, maxTransactionAmount: Number(e.target.value) }))} />
								</div>
								<div>
									<label>Session Timeout (minutes)</label>
									<input type="number" min="5" max="480" value={systemSettings.sessionTimeout} onChange={(e) => setSystemSettings((prev) => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 60 }))} />
								</div>
								<div>
									<label>Max Login Attempts</label>
									<input type="number" min="1" max="20" value={systemSettings.maxLoginAttempts} onChange={(e) => setSystemSettings((prev) => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 5 }))} />
								</div>
							</div>
							<div className="pt-4 border-t border-slate-200 space-y-4 divide-y divide-slate-200">
								<div className="flex items-center justify-between pt-4 first:pt-0">
									<div>
										<h4 className="font-medium text-slate-800">Enable Two-Factor Auth</h4>
										<p className="text-sm text-slate-500">Require 2FA for all admin accounts.</p>
									</div>
									<ToggleSwitch enabled={systemSettings.enableTwoFA} onChange={() => setSystemSettings((prev) => ({ ...prev, enableTwoFA: !prev.enableTwoFA }))} />
								</div>
								<div className="flex items-center justify-between pt-4">
									<div>
										<h4 className="font-medium text-slate-800">Require Email Verification</h4>
										<p className="text-sm text-slate-500">Users must verify their email after registration.</p>
									</div>
									<ToggleSwitch enabled={systemSettings.requireEmailVerification} onChange={() => setSystemSettings((prev) => ({ ...prev, requireEmailVerification: !prev.requireEmailVerification }))} />
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button onClick={() => handleSaveSettings('system', systemSettings, validateSystemSettings)} disabled={saving === 'system'}>
								{saving === 'system' ? 'Saving...' : 'Save System Settings'}
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}
