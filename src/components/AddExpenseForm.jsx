import { useRef } from 'react';
import { toast } from 'react-toastify';
import supabase from '../services/supabase';

export function AddExpenseForm({ budgets, onExpenseAdd }) {
	const formRef = useRef();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const { name, amount, budgetId } = Object.fromEntries(formData);

		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				toast.error('Please log in to add an expense');
				return;
			}

			const { data, error } = await supabase
				.from('expenses')
				.insert({
					name,
					amount: +amount,
					budget_id: budgetId,
					user_id: user.id,
					created_at: new Date().toISOString()
				})
				.select()
				.single();

			if (error) throw error;

			toast.success('Expense added!');
			formRef.current.reset();
			onExpenseAdd?.(data);
		} catch (error) {
			console.error('Error adding expense:', error);
			toast.error('Failed to add expense');
		}
	};

	return (
		<div className='font-jetBrain max-w-[600px] p-6 bg-white rounded-2xl flex-1'>
			<h2 className='text-navy text-2xl'>
				Add New{" "}
				<span className='text-fluo'>
					{budgets.length === 1 && `${budgets.map((budg) => budg.name)}`}
				</span>{" "}
				Expense
			</h2>
			<form ref={formRef} onSubmit={handleSubmit} className='grid gap-4 p-4'>
				<div className='expense-inputs'>
					<div className='grid gap-4'>
						<label className='text-navy text-lg' htmlFor='expenseName'>
							Expense Name
						</label>
						<input
							className='text-navy rounded-lg ring-2 ring-navy py-2 px-4'
							type='text'
							name='name'
							id='expenseName'
							placeholder='e.g., Coffee'
							required
						/>
					</div>
					<div className='grid gap-4'>
						<label className='text-navy text-lg' htmlFor='expenseAmount'>
							Amount
						</label>
						<input
							className='text-navy rounded-lg ring-2 ring-navy py-2 px-4'
							type='number'
							step='0.01'
							inputMode='decimal'
							name='amount'
							id='expenseAmount'
							placeholder='e.g., 3.50'
							required
						/>
					</div>
				</div>
				<div className='grid gap-4' hidden={budgets.length === 1}>
					<label className='text-navy text-lg' htmlFor='budgetId'>
						Budget Category
					</label>
					<select
						name='budgetId'
						className='rounded-lg py-2 px-4 ring-2 ring-navy'
						id='budgetId'
						required>
						{budgets.map((budget) => {
							return (
								<option key={budget.id} value={budget.id}>
									{budget.name}
								</option>
							);
						})}
					</select>
				</div>
				<button
					type='submit'
					className='px-6 py-2 mt-2 flex gap-2 bg-fluo items-center rounded-md hover:bg-fluo/80 transition-all duration-300 max-w-[220px]'>
					<span className='text-lg text-navy'>Add Expense</span>
				</button>
			</form>
		</div>
	);
}
