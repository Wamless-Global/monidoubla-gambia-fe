'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage, getSettings } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// Interfaces from the original file to ensure all fields are captured
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
	logoFile?: File;
	logoUrl?: string;
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
	enforcePhoneBeforePHGH: boolean;
	enforceMomoBeforePHGH?: boolean;
	countdownDuration: string;
	allowExtraTimeOnProof: boolean;
	extraTimeAmount: string;
	penaltyApplication: 'both' | 'ph' | 'gh';
}

interface SecuritySettings {
	allowLogin: boolean;
	allowAccountCreation: boolean;
	allowDuplicatePhoneSignup: boolean;
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
		country: '',
		autoMatching: false,
		commissionRate: '',
		maintenanceMode: false,
		maintenanceMessage: '',
		referralGeneration: '',
		referralBonusWithdrawableAmount: 0,
		referralBonusReleaseType: 'completed',
		platform_base_currency: '',
	});
	const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ smsProvider: 'twilio', smsApiKey: '', smsApiSecret: '', smsSenderId: '', emailHost: '', emailPort: 0, emailUser: '', emailPassword: '', emailFromName: '' });
	const [systemSettings, setSystemSettings] = useState<SystemSettings>({
		maxTransactionAmount: 0,
		minTransactionAmount: 0,
		sessionTimeout: 0,
		backupFrequency: '',
		enableTwoFA: false,
		requireEmailVerification: false,
		maxLoginAttempts: 0,
		enforcePhoneBeforePHGH: false,
		enforceMomoBeforePHGH: false,
		countdownDuration: '',
		allowExtraTimeOnProof: false,
		extraTimeAmount: '',
		penaltyApplication: 'both',
	});
	const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({ allowLogin: false, allowAccountCreation: false, allowDuplicatePhoneSignup: false });
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
		if (!generalSettings.platformName.trim()) newErrors.platformName = 'Platform name is required';
		else if (generalSettings.platformName.length < 2) newErrors.platformName = 'Platform name must be at least 2 characters';
		if (!generalSettings.platformCurrency.trim()) newErrors.platformCurrency = 'Platform currency is required';
		if (generalSettings.maintenanceMode && !generalSettings.maintenanceMessage.trim()) newErrors.maintenanceMessage = 'Maintenance message is required when maintenance mode is enabled';
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
		const newErrors: Record<string, string> = {};
		if (systemSettings.maxTransactionAmount <= systemSettings.minTransactionAmount) newErrors.maxTransactionAmount = 'Maximum transaction amount must be greater than minimum';
		if (systemSettings.minTransactionAmount < 1) newErrors.minTransactionAmount = 'Minimum transaction amount must be greater than 0';
		if (systemSettings.sessionTimeout < 5 || systemSettings.sessionTimeout > 480) newErrors.sessionTimeout = 'Session timeout must be between 5-480 minutes';
		if (systemSettings.maxLoginAttempts < 1 || systemSettings.maxLoginAttempts > 20) newErrors.maxLoginAttempts = 'Maximum login attempts must be between 1-20';
		const countdownRegex = /^(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)$/i;
		if (systemSettings.countdownDuration && !countdownRegex.test(systemSettings.countdownDuration.trim())) newErrors.countdownDuration = 'Countdown format should be like "30 minutes", "24 hours", "7 days", "1 month"';
		if (systemSettings.extraTimeAmount && !countdownRegex.test(systemSettings.extraTimeAmount.trim())) newErrors.extraTimeAmount = 'Extra time format should be like "30 minutes", "24 hours", "7 days", "1 month"';
		setErrors((prev) => ({ ...prev, ...newErrors }));
		return Object.keys(newErrors).length === 0;
	};

	const objectToUpdates = (obj: Record<string, any>) =>
		Object.entries(obj)
			.filter(([key, value]) => key !== 'logoFile' && key !== 'smsSenderId' && value !== '' && value !== null && value !== undefined)
			.map(([key, value]) => ({ key, setting_value: typeof value === 'string' ? value : JSON.stringify(value) }));

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
							<CardDescription>Configure basic platform information and referral bonuses.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label>Platform Name</label>
								<input type="text" value={generalSettings.platformName} onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })} />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label>Platform Currency</label>
									<input type="text" value={generalSettings.platformCurrency} onChange={(e) => setGeneralSettings({ ...generalSettings, platformCurrency: e.target.value })} placeholder="e.g. GHC" />
								</div>
								<div>
									<label>Platform Base Currency</label>
									<input type="text" value={generalSettings.platform_base_currency ?? ''} onChange={(e) => setGeneralSettings({ ...generalSettings, platform_base_currency: e.target.value })} placeholder="e.g. USD" />
								</div>
								<div>
									<label>Country</label>
									<input type="text" value={generalSettings.country} onChange={(e) => setGeneralSettings({ ...generalSettings, country: e.target.value })} />
								</div>
							</div>
							<div className="pt-4 border-t space-y-4">
								<h4 className="font-semibold text-slate-800">Referral Settings</h4>
								<div>
									<label>Commission Rate (%)</label>
									<input type="text" value={generalSettings.commissionRate} onChange={(e) => setGeneralSettings({ ...generalSettings, commissionRate: e.target.value })} placeholder="e.g. 10, 5, 2.5" />
								</div>
								<div>
									<label>Referral Generations</label>
									<input type="text" value={generalSettings.referralGeneration ?? ''} onChange={(e) => setGeneralSettings({ ...generalSettings, referralGeneration: e.target.value })} placeholder="e.g. 1, 2, 3" />
								</div>
								<div>
									<label>Referral Bonus Withdrawable Amount</label>
									<input type="number" min={0} value={generalSettings.referralBonusWithdrawableAmount ?? 0} onChange={(e) => setGeneralSettings({ ...generalSettings, referralBonusWithdrawableAmount: Number(e.target.value) })} />
								</div>
								<div>
									<label>Referral Bonus Release Condition</label>
									<select value={generalSettings.referralBonusReleaseType ?? 'completed'} onChange={(e) => setGeneralSettings({ ...generalSettings, referralBonusReleaseType: e.target.value as 'completed' | 'matured' })}>
										<option value="completed">When user's PH is completed</option>
										<option value="matured">When user's PH is matured</option>
									</select>
								</div>
							</div>
							<div className="pt-4 border-t">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">Auto Matching</h4>
									</div>
									<ToggleSwitch enabled={generalSettings.autoMatching} onChange={() => setGeneralSettings({ ...generalSettings, autoMatching: !generalSettings.autoMatching })} />
								</div>
							</div>
							<div className="pt-4 border-t">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">Maintenance Mode</h4>
									</div>
									<ToggleSwitch enabled={generalSettings.maintenanceMode} onChange={() => setGeneralSettings({ ...generalSettings, maintenanceMode: !generalSettings.maintenanceMode })} />
								</div>
								{generalSettings.maintenanceMode && (
									<div className="mt-4">
										<label>Maintenance Message</label>
										<textarea value={generalSettings.maintenanceMessage} onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMessage: e.target.value })} rows={3} />
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
								</div>
								<ToggleSwitch enabled={securitySettings.allowLogin} onChange={() => setSecuritySettings({ ...securitySettings, allowLogin: !securitySettings.allowLogin })} />
							</div>
							<div className="flex items-center justify-between pt-4">
								<div>
									<h4 className="font-medium text-slate-800">Allow Account Creation</h4>
								</div>
								<ToggleSwitch enabled={securitySettings.allowAccountCreation} onChange={() => setSecuritySettings({ ...securitySettings, allowAccountCreation: !securitySettings.allowAccountCreation })} />
							</div>
							<div className="flex items-center justify-between pt-4">
								<div>
									<h4 className="font-medium text-slate-800">Allow Duplicate Phone Signup</h4>
								</div>
								<ToggleSwitch enabled={securitySettings.allowDuplicatePhoneSignup} onChange={() => setSecuritySettings({ ...securitySettings, allowDuplicatePhoneSignup: !securitySettings.allowDuplicatePhoneSignup })} />
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
							<h4 className="font-medium text-slate-800">SMS Settings</h4>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label>SMS Provider</label>
									<select value={notificationSettings.smsProvider} onChange={(e) => setNotificationSettings({ ...notificationSettings, smsProvider: e.target.value })}>
										<option value="TwilioSmsProvider">Twilio</option>
										<option value="termii">Termii</option>
									</select>
								</div>
								<div>
									<label>Sender ID</label>
									<input type="text" value={notificationSettings.smsSenderId} disabled placeholder="Sender ID is disabled" className="cursor-not-allowed bg-slate-100" />
								</div>
							</div>
							<h4 className="font-medium text-slate-800 pt-4 border-t">Email Settings</h4>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label>SMTP Host</label>
									<input type="text" value={notificationSettings.emailHost} onChange={(e) => setNotificationSettings({ ...notificationSettings, emailHost: e.target.value })} />
								</div>
								<div>
									<label>SMTP Port</label>
									<input type="number" value={notificationSettings.emailPort} onChange={(e) => setNotificationSettings({ ...notificationSettings, emailPort: parseInt(e.target.value) || 587 })} />
								</div>
								<div>
									<label>Email Username</label>
									<input type="email" value={notificationSettings.emailUser} onChange={(e) => setNotificationSettings({ ...notificationSettings, emailUser: e.target.value })} />
								</div>
								<div>
									<label>Email Password</label>
									<input type="password" value={notificationSettings.emailPassword} onChange={(e) => setNotificationSettings({ ...notificationSettings, emailPassword: e.target.value })} />
								</div>
								<div className="sm:col-span-2">
									<label>From Name</label>
									<input type="text" value={notificationSettings.emailFromName} onChange={(e) => setNotificationSettings({ ...notificationSettings, emailFromName: e.target.value })} />
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
									<input type="number" value={systemSettings.minTransactionAmount} onChange={(e) => setSystemSettings({ ...systemSettings, minTransactionAmount: Number(e.target.value) })} />
								</div>
								<div>
									<label>Max Transaction Amount</label>
									<input type="number" value={systemSettings.maxTransactionAmount} onChange={(e) => setSystemSettings({ ...systemSettings, maxTransactionAmount: Number(e.target.value) })} />
								</div>
								<div>
									<label>Session Timeout (minutes)</label>
									<input type="number" min="5" max="480" value={systemSettings.sessionTimeout} onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: parseInt(e.target.value) || 60 })} />
								</div>
								<div>
									<label>Max Login Attempts</label>
									<input type="number" min="1" max="20" value={systemSettings.maxLoginAttempts} onChange={(e) => setSystemSettings({ ...systemSettings, maxLoginAttempts: parseInt(e.target.value) || 5 })} />
								</div>
								<div>
									<label>Backup Frequency</label>
									<select value={systemSettings.backupFrequency} onChange={(e) => setSystemSettings((prev) => ({ ...prev, backupFrequency: e.target.value }))}>
										<option value="hourly">Hourly</option>
										<option value="daily">Daily</option>
										<option value="weekly">Weekly</option>
										<option value="monthly">Monthly</option>
									</select>
								</div>
							</div>
							<div className="pt-4 border-t border-slate-200 space-y-4 divide-y divide-slate-200">
								<div className="flex items-center justify-between pt-4 first:pt-0">
									<div>
										<h4 className="font-medium text-slate-800">Require Email Verification</h4>
									</div>
									<ToggleSwitch enabled={systemSettings.requireEmailVerification} onChange={() => setSystemSettings({ ...systemSettings, requireEmailVerification: !systemSettings.requireEmailVerification })} />
								</div>
								<div className="flex items-center justify-between pt-4">
									<div>
										<h4 className="font-medium text-slate-800">Enable Two-Factor Auth</h4>
									</div>
									<ToggleSwitch enabled={systemSettings.enableTwoFA} onChange={() => setSystemSettings({ ...systemSettings, enableTwoFA: !systemSettings.enableTwoFA })} />
								</div>
							</div>
							<div className="pt-4 border-t border-slate-200 space-y-4">
								<h4 className="font-semibold text-slate-800">PH/GH Enforcement & Penalties</h4>
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">Enforce Phone Before PH/GH</h4>
									</div>
									<ToggleSwitch enabled={systemSettings.enforcePhoneBeforePHGH} onChange={() => setSystemSettings({ ...systemSettings, enforcePhoneBeforePHGH: !systemSettings.enforcePhoneBeforePHGH })} />
								</div>
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">Enforce Momo Before PH/GH</h4>
									</div>
									<ToggleSwitch enabled={systemSettings.enforceMomoBeforePHGH ?? false} onChange={() => setSystemSettings({ ...systemSettings, enforceMomoBeforePHGH: !systemSettings.enforceMomoBeforePHGH })} />
								</div>
								<div>
									<label>Countdown Duration</label>
									<input type="text" value={systemSettings.countdownDuration} onChange={(e) => setSystemSettings({ ...systemSettings, countdownDuration: e.target.value })} placeholder='e.g., "7 days", "24 hours"' />
								</div>
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">Allow Extra Time On Proof</h4>
									</div>
									<ToggleSwitch enabled={systemSettings.allowExtraTimeOnProof} onChange={() => setSystemSettings({ ...systemSettings, allowExtraTimeOnProof: !systemSettings.allowExtraTimeOnProof })} />
								</div>
								<div>
									<label>Extra Time Amount</label>
									<input type="text" value={systemSettings.extraTimeAmount} onChange={(e) => setSystemSettings({ ...systemSettings, extraTimeAmount: e.target.value })} placeholder='e.g., "30 minutes", "1 day"' />
								</div>
								<div>
									<label>Penalty Application</label>
									<select value={systemSettings.penaltyApplication} onChange={(e) => setSystemSettings({ ...systemSettings, penaltyApplication: e.target.value as 'both' | 'ph' | 'gh' })}>
										<option value="both">Apply to both users</option>
										<option value="ph">Apply to PH user only</option>
										<option value="gh">Apply to GH user only</option>
									</select>
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
