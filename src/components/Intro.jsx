import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { ImageSlider } from './utility/ImageSlider';
import supabase from '../services/supabase';

export function Intro() {
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const formData = new FormData(e.target);
			const email = formData.get('email');
			const password = formData.get('password');
			const name = formData.get('userName');

			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						name,
					},
				},
			});

			if (error) throw error;

			const { error: settingsError } = await supabase.from('user_settings').insert({
				user_id: data.user.id,
				income: 0,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			});

			if (settingsError && settingsError.code !== '23505') {
				console.error('Error creating user settings:', settingsError);
			}

			if (name.toLowerCase() === 'rimane' || name.toLowerCase() === 'riri') {
				toast.success(`Hi baby, so glad you're trying it <3`);
			} else {
				toast.success(`Welcome, ${name}! Please check your email to verify your account.`);
			}

			navigate('/');
		} catch (error) {
			console.error('Error signing up:', error);
			toast.error(error.message || 'There was a problem creating your account.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col items-center justify-center min-h-screen'>
			<div className='grid grid-cols-1 gap-8 text-center'>
				<div className='sm:w-3/4 mx-auto'>
					<h1 className='text-3xl sm:text-5xl text-alice font-jetBrain'>
						Take Control of <span className='text-fluo'>Your Money</span>
					</h1>
					<p className='text-alice text-lg mt-4'>
						Personal budgeting is the secret to financial freedom. Start your journey today.
					</p>

					<div className='sm:mt-12 mt-4 w-4/5 mx-auto sm:mx-0'>
						<form
							onSubmit={handleSubmit}
							className='sm:text-start text-center grid grid-cols-1 gap-4'>
							<input
								className='text-navy rounded-lg py-2 px-4'
								type='text'
								name='userName'
								required
								placeholder='Enter your name'
								aria-label='Your Name'
								autoComplete='given-name'
							/>
							<input
								className='text-navy rounded-lg py-2 px-4'
								type='email'
								name='email'
								required
								placeholder='Enter your email'
								aria-label='Your Email'
								autoComplete='email'
							/>
							<input
								className='text-navy rounded-lg py-2 px-4'
								type='password'
								name='password'
								required
								placeholder='Create a password'
								aria-label='Your Password'
								autoComplete='new-password'
								minLength={6}
							/>
							<button
								type='submit'
								disabled={loading}
								className='text-center group shadow-md bg-fluo text-black py-1.5 px-6 rounded-md my-2 hover:bg-fluo/80 transition-all duration-300 flex justify-center gap-2 items-center'>
								{loading ? (
									<span className='text-lg px-2'>Creating account...</span>
								) : (
									<>
										<span className='text-lg px-2'>Start budgeting</span>
										<FaUserPlus className='group-transition-all group-duration-300 ml-2 text-black' />
									</>
								)}
							</button>
						</form>
					</div>
				</div>

				<div className='w-4/5 mx-auto'>
					<ImageSlider />
				</div>
			</div>
		</div>
	);
}
