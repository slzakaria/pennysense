import { useState } from 'react';
import supabase from '../services/supabase';
import { toast } from 'react-toastify';

export function Auth() {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: window.location.origin,
			},
		});

		if (error) {
			toast.error(error.message);
		} else {
			toast.success('Check your email for the login link!');
		}
		setLoading(false);
	};

	return (
		<div className='flex flex-col items-center justify-center min-h-screen p-4'>
			<form onSubmit={handleLogin} className='w-full max-w-sm space-y-4'>
				<h1 className='text-2xl font-bold text-alice mb-8'>Sign In to PennySense</h1>
				<input
					type='email'
					placeholder='Your email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className='w-full p-2 border rounded text-navy'
				/>
				<button
					type='submit'
					disabled={loading}
					className='w-full bg-fluo text-navy p-2 rounded hover:bg-fluo/80'>
					{loading ? 'Loading...' : 'Send magic link'}
				</button>
			</form>
		</div>
	);
}
