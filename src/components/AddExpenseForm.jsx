import { useEffect, useRef } from "react";
import { useFetcher } from "react-router-dom";
import { FaFileCirclePlus } from "react-icons/fa6";

const AddExpenseForm = ({ budgets }) => {
	const fetcher = useFetcher();
	const isSubmitting = fetcher.state === "submitting";

	const formRef = useRef();
	const focusRef = useRef();

	useEffect(() => {
		if (!isSubmitting) {
			formRef.current.reset();
			focusRef.current.focus();
		}
	}, [isSubmitting]);

	return (
		<div className='font-jetBrain max-w-[600px] p-6 border-2 rounded-2xl flex-1'>
			<h2 className='text-alice text-2xl'>
				Add New{" "}
				<span className='text-fluo'>
					{budgets.length === 1 && `${budgets.map((budg) => budg.name)}`}
				</span>{" "}
				<span className='text-fluo'>Expense</span>
			</h2>
			<fetcher.Form method='post' className='grid gap-4 p-4' ref={formRef}>
				<div className='expense-inputs'>
					<div className='grid gap-4'>
						<label className='text-alice text-lg' htmlFor='newExpense'>
							Expense Name
						</label>
						<input
							className='text-navy'
							type='text'
							name='newExpense'
							id='newExpense'
							placeholder='e.g., Coffee'
							ref={focusRef}
							required
						/>
					</div>
					<div className='grid-xs'>
						<label className='text-alice text-lg' htmlFor='newExpenseAmount'>
							Amount
						</label>
						<input
							className='text-navy'
							type='number'
							step='0.01'
							inputMode='decimal'
							name='newExpenseAmount'
							id='newExpenseAmount'
							placeholder='e.g., 3.50'
							required
						/>
					</div>
				</div>
				<div className='grid gap-2' hidden={budgets.length === 1}>
					<label className='text-alice text-lg' htmlFor='newExpenseBudget'>
						Budget Category
					</label>
					<select name='newExpenseBudget' id='newExpenseBudget' required>
						{budgets
							.sort((a, b) => a.createdAt - b.createdAt)
							.map((budget) => {
								return (
									<option key={budget.id} value={budget.id}>
										{budget.name}
									</option>
								);
							})}
					</select>
				</div>
				<input type='hidden' name='_action' value='createExpense' />
				<button
					type='submit'
					className='px-6 py-1 flex gap-2 bg-alice items-center rounded-md hover:bg-fluo transition-all duration-300 max-w-[220px]'
					disabled={isSubmitting}>
					{isSubmitting ? (
						<span>Submitting…</span>
					) : (
						<>
							<span className='text-lg text-navy'>Add Expense</span>
							<FaFileCirclePlus className='w-5 h-5 text-navy' />
						</>
					)}
				</button>
			</fetcher.Form>
		</div>
	);
};
export default AddExpenseForm;
