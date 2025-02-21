import { useRef } from 'react';
import { toast } from 'react-toastify';
import supabase from '../services/supabase';
import { useErrorHandler } from '../hooks/useErrorHandler';

export function AddBudgetForm({ onBudgetAdd }) {
	const formRef = useRef();
	const { handleError } = useErrorHandler();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const { name, amount } = Object.fromEntries(formData);

		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				toast.error('Please log in to create a budget');
				return;
			}

			const { data, error } = await supabase
				.from('budgets')
				.insert({
					name,
					amount: +amount,
					user_id: user.id,
					created_at: new Date().toISOString()
				})
				.select()
				.single();

			if (error) throw error;

			toast.success('Budget created!');
			formRef.current.reset();
			onBudgetAdd?.(data);
		} catch (error) {
			handleError(error, 'Failed to create budget');
		}
	};

	return (
		<div className='font-jetBrain max-w-[600px] p-6 bg-white rounded-2xl flex-1'>
			<h2 className='text-navy text-2xl'>Add new budget</h2>
			<form ref={formRef} onSubmit={handleSubmit} className='grid gap-4 p-4'>
				<div className='grid gap-4'>
					<label className='text-navy text-lg' htmlFor='budgetName'>
						Budget Name
					</label>
					<input
						className='text-navy rounded-lg ring-2 ring-navy py-2 px-4'
						type='text'
						name='name'
						id='budgetName'
						placeholder='... Groceries'
						required
					/>
				</div>
				<div className='grid gap-4'>
					<label className='text-navy text-lg' htmlFor='budgetAmount'>
						Amount
					</label>
					<input
						className='text-navy rounded-lg ring-2 ring-navy py-2 px-4'
						type='number'
						step='0.01'
						name='amount'
						id='budgetAmount'
						placeholder='... $350'
						required
						inputMode='decimal'
					/>
				</div>
				<button
					type='submit'
					className='px-6 py-2 mt-2 flex gap-2 bg-fluo items-center rounded-md hover:bg-fluo/80 transition-all duration-300 max-w-[230px]'>
					Create Budget
				</button>
			</form>
		</div>
	);
}
