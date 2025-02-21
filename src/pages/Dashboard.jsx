import { useState, Fragment, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BsCurrencyExchange, BsCalculator, BsCartCheck } from 'react-icons/bs';
import { Intro } from '../components/Intro';
import { AddBudgetForm } from '../components/AddBudgetForm';
import { AddExpenseForm } from '../components/AddExpenseForm';
import { BudgetItem } from '../components/BudgetItem';
import { Table } from '../components/Table';
import supabase from '../services/supabase';
import { useErrorHandler } from '../hooks/useErrorHandler';

export function Dashboard() {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [income, setIncome] = useState(0);
	const [showBudgetForm, setShowBudgetForm] = useState(false);
	const [showExpenseForm, setShowExpenseForm] = useState(false);
	const [budgets, setBudgets] = useState([]);
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(true);
	const incomeRef = useRef(null);
	const { handleError } = useErrorHandler();

	useEffect(() => {
		// Check authentication status
		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user);
			if (!user) {
				navigate('/login');
			}
		});

		// Subscribe to auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session?.user);
			if (!session?.user) {
				navigate('/login');
			}
		});

		return () => subscription.unsubscribe();
	}, [navigate]);

	useEffect(() => {
		const fetchData = async () => {
			if (!user) return;

			try {
				setLoading(true);

				// First ensure user settings exist
				const { error: settingsCheckError } = await supabase
					.from('user_settings')
					.select('id')
					.eq('user_id', user.id)
					.single();

				if (settingsCheckError && settingsCheckError.code === 'PGRST116') {
					try {
						await supabase.from('user_settings').insert({
							user_id: user.id,
							income: 0,
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
						});
					} catch (insertError) {
						handleError(insertError, 'Failed to create user settings');
						return;
					}
				}

				try {
					const [budgetsResponse, expensesResponse, settingsResponse] = await Promise.all([
						supabase.from('budgets').select('*').eq('user_id', user.id),
						supabase.from('expenses').select('*').eq('user_id', user.id),
						supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
					]);

					if (budgetsResponse.error) throw budgetsResponse.error;
					if (expensesResponse.error) throw expensesResponse.error;
					if (settingsResponse.error) throw settingsResponse.error;

					setBudgets(budgetsResponse.data || []);
					setExpenses(expensesResponse.data || []);
					if (settingsResponse.data) {
						setIncome(settingsResponse.data.income);
					}
				} catch (fetchError) {
					handleError(fetchError, 'Failed to fetch data');
				}
			} catch (error) {
				handleError(error, 'An unexpected error occurred');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user, handleError]);

	const totalBudget = budgets.reduce((acc, budget) => acc + budget.amount, 0);
	const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
	const availableBudget = income - totalExpenses;

	useEffect(() => {
		if (availableBudget < 0) {
			toast.error(`You are over budget by $ ${Math.abs(availableBudget)}`);
		}
	}, [availableBudget]);

	function closeModal() {
		setModalOpen(false);
	}

	function openModal() {
		setModalOpen(true);
	}

	function toggleBudgetForm() {
		setShowBudgetForm(!showBudgetForm);
	}

	function toggleExpenseForm() {
		setShowExpenseForm(!showExpenseForm);
	}

	async function saveIncome() {
		if (!user) return;

		try {
			// Use upsert with the correct unique constraint
			const { error } = await supabase.from('user_settings').upsert(
				{
					user_id: user.id,
					income: Number(incomeRef.current.value),
					updated_at: new Date().toISOString(),
				},
				{
					onConflict: 'user_id', // Specify the unique constraint
					ignoreDuplicates: false, // We want to update existing records
				}
			);

			if (error) throw error;

			setIncome(Number(incomeRef.current.value));
			toast.success('Income saved successfully!');
			closeModal();
		} catch (error) {
			console.error('Error saving income:', error);
			toast.error('Failed to save income');
		}
	}

	const handleBudgetAdd = (newBudget) => {
		setBudgets((prev) => [...prev, newBudget]);
		setShowBudgetForm(false);
	};

	const handleExpenseAdd = async (newExpense) => {
		setExpenses((prev) => [...prev, newExpense]);
		setShowExpenseForm(false);
		await fetchData(); // Refetch data after adding an expense
	};

	const fetchData = async () => {
		if (!user) return;

		try {
			setLoading(true);
			// ... existing data fetching logic
		} catch (error) {
			handleError(error, 'An unexpected error occurred');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<>
			{user ? (
				<div className='px-0 mx-auto overflow-x-hidden max-w-[1200px]'>
					<div className='flex flex-wrap justify-center sm:justify-between items-center py-4'>
						{/* header */}
						<h1 className='text-3xl sm:text-5xl text-alice font-jetBrain py-6'>
							{' '}
							Welcome back, <span className='text-fluo capitalize'>
								{user.user_metadata.name}
							</span>{' '}
							<br />
							<span className='text-lg mt-2'>
								You have <span className='text-fluo'>$ {availableBudget} </span> left to spend this
								month.
								<br />
								Spent <span className='text-tomato'>$ {totalExpenses} </span> so far out of{' '}
								<span className='text-sunny'> $ {totalBudget} </span> budgeted.
							</span>
						</h1>

						{/* action buttons */}
						<div className='flex flex-wrap flex-col w-full sm:w-[150px] sm:flex-row justify-around lg:flex-col gap-4 sm:justify-end items-end font-jetBrain'>
							<button
								type='button'
								onClick={openModal}
								className='rounded-lg bg-alice min-w-[145px] w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-navy hover:bg-alice/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75'>
								<span>Income</span> <BsCurrencyExchange />
							</button>
							<button
								type='button'
								onClick={toggleBudgetForm}
								className='rounded-lg bg-alice min-w-[145px] w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-navy hover:bg-alice/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75'>
								<span>Budget</span> <BsCalculator />
							</button>
							<button
								type='button'
								disabled={!budgets || budgets.length < 1}
								onClick={toggleExpenseForm}
								className='rounded-lg bg-alice min-w-[145px] w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-navy hover:bg-alice/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75'>
								<span>Expense</span> <BsCartCheck />
							</button>
						</div>

						<Transition appear show={modalOpen} as={Fragment}>
							<Dialog as='div' className='relative z-10' onClose={closeModal}>
								<Transition.Child
									as={Fragment}
									enter='ease-out duration-300'
									enterFrom='opacity-0'
									enterTo='opacity-100'
									leave='ease-in duration-200'
									leaveFrom='opacity-100'
									leaveTo='opacity-0'>
									<div className='fixed inset-0 bg-black/25' />
								</Transition.Child>

								<div className='fixed inset-0 overflow-y-auto'>
									<div className='flex min-h-full items-center justify-center p-4 text-center'>
										<Transition.Child
											as={Fragment}
											enter='ease-out duration-300'
											enterFrom='opacity-0 scale-95'
											enterTo='opacity-100 scale-100'
											leave='ease-in duration-200'
											leaveFrom='opacity-100 scale-100'
											leaveTo='opacity-0 scale-95'>
											<Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
												<Dialog.Title as='h3' className='text-lg font-medium leading-6 text-navy'>
													Set Income
												</Dialog.Title>
												<form
													onSubmit={(e) => {
														e.preventDefault();
														saveIncome();
													}}>
													<div className='mt-2'>
														<input
															type='number'
															className='w-full rounded-lg py-2 px-4 text-navy ring-2 ring-navy'
															placeholder='Enter your income'
															ref={incomeRef}
															defaultValue={income}
															required
														/>
													</div>

													<div className='mt-4 flex gap-4'>
														<button
															type='submit'
															className='inline-flex justify-center rounded-md border border-transparent bg-fluo px-4 py-2 text-sm font-medium text-navy hover:bg-fluo/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'>
															Save
														</button>
														<button
															type='button'
															className='inline-flex justify-center rounded-md border border-transparent bg-alice px-4 py-2 text-sm font-medium text-navy hover:bg-alice/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
															onClick={closeModal}>
															Cancel
														</button>
													</div>
												</form>
											</Dialog.Panel>
										</Transition.Child>
									</div>
								</div>
							</Dialog>
						</Transition>

						<Transition appear show={showBudgetForm} as={Fragment}>
							<Dialog as='div' className='relative z-10 sm:w-[600px]' onClose={toggleBudgetForm}>
								<Transition.Child
									as={Fragment}
									enter='ease-out duration-300'
									enterFrom='opacity-0'
									enterTo='opacity-100'
									leave='ease-in duration-200'
									leaveFrom='opacity-100'
									leaveTo='opacity-0'>
									<div className='fixed inset-0 bg-black/25' />
								</Transition.Child>

								<div className='fixed inset-0 overflow-y-auto'>
									<div className='flex min-h-full items-center justify-center p-4 text-center'>
										<Transition.Child
											as={Fragment}
											enter='ease-out duration-300'
											enterFrom='opacity-0 scale-95'
											enterTo='opacity-100 scale-100'
											leave='ease-in duration-200'
											leaveFrom='opacity-100 scale-100'
											leaveTo='opacity-0 scale-95'>
											<Dialog.Panel className='w-full max-w-[600px] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
												<AddBudgetForm onBudgetAdd={handleBudgetAdd} />
											</Dialog.Panel>
										</Transition.Child>
									</div>
								</div>
							</Dialog>
						</Transition>

						<Transition appear show={showExpenseForm} as={Fragment}>
							<Dialog as='div' className='relative z-10 sm:w-[600px]' onClose={toggleExpenseForm}>
								<Transition.Child
									as={Fragment}
									enter='ease-out duration-300'
									enterFrom='opacity-0'
									enterTo='opacity-100'
									leave='ease-in duration-200'
									leaveFrom='opacity-100'
									leaveTo='opacity-0'>
									<div className='fixed inset-0 bg-black/25' />
								</Transition.Child>

								<div className='fixed inset-0 overflow-y-auto'>
									<div className='flex min-h-full items-center justify-center p-4 text-center'>
										<Transition.Child
											as={Fragment}
											enter='ease-out duration-300'
											enterFrom='opacity-0 scale-95'
											enterTo='opacity-100 scale-100'
											leave='ease-in duration-200'
											leaveFrom='opacity-100 scale-100'
											leaveTo='opacity-0 scale-95'>
											<Dialog.Panel className='w-full max-w-[600px] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
												<AddExpenseForm budgets={budgets} onExpenseAdd={handleExpenseAdd} />
											</Dialog.Panel>
										</Transition.Child>
									</div>
								</div>
							</Dialog>
						</Transition>
					</div>
					<div className='grid gap-2 w-full pb-12 pt-6'>
						{budgets && budgets.length > 0 ? (
							<div className='grid gap-4 w-full mx-auto'>
								<div className='max-w-[1200px]'>
									<h2 className='text-alice text-xl font-heebo mt-8'>Existing Budgets</h2>
									<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
										{budgets.map((budget) => (
											<BudgetItem key={budget.id} budget={budget} />
										))}
									</div>
									{expenses && expenses.length > 0 && (
										<div className='grid gap-6'>
											<h2 className='text-alice text-xl font-heebo mt-12'>Recent Expenses</h2>
											<Table
												expenses={expenses.sort((a, b) => b.createdAt - a.createdAt).slice(0, 8)}
											/>
											{expenses.length > 6 && (
												<Link
													to='expenses'
													className='rounded-lg w-1/5 mx-auto text-center bg-alice flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-navy hover:bg-alice/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75'>
													View all expenses
												</Link>
											)}
										</div>
									)}
								</div>
							</div>
						) : (
							<div className='grid grid-cols-1 gap-2 text-alice font-heebo py-6'>
								<p>Personal budgeting is the secret to financial freedom.</p>
								<p className='pb-6'>Create a budget to get started!</p>
								<AddBudgetForm />
							</div>
						)}
					</div>
				</div>
			) : (
				<Intro />
			)}
		</>
	);
}
