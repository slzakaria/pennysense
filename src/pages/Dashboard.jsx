import { useState, Fragment, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BsCurrencyExchange, BsCalculator, BsCartCheck } from 'react-icons/bs';
import { getTotalExpenses, getTotalBudgets } from '../helpers';
import { Intro } from '../components/Intro';
import { AddBudgetForm } from '../components/AddBudgetForm';
import { AddExpenseForm } from '../components/AddExpenseForm';
import { BudgetItem } from '../components/BudgetItem';
import { Table } from '../components/Table';

import { createBudget, createExpense, deleteItem, fetchData, waait } from '../helpers';

export function dashboardLoader() {
	const userName = fetchData('userName');
	const budgets = fetchData('budgets');
	const expenses = fetchData('expenses');
	return { userName, budgets, expenses };
}

export async function dashboardAction({ request }) {
	await waait();

	const data = await request.formData();
	const { _action, ...values } = Object.fromEntries(data);

	if (_action === 'newUser') {
		try {
			localStorage.setItem('userName', JSON.stringify(values.userName));

			if (values.userName != 'rimane') {
				return toast.success(`Welcome, ${values.userName}`);
			}
			if (
				values.userName == 'rimane' ||
				values.userName == 'Rimane' ||
				values.userName == 'RIMANE' ||
				values.userName == 'Riri'
			) {
				return toast.success(`Hi baby ,so glad you're trying it <3`);
			}
		} catch (e) {
			throw new Error('There was a problem creating your account.');
		}
	}

	if (_action === 'createBudget') {
		try {
			createBudget({
				name: values.newBudget,
				amount: values.newBudgetAmount,
			});
			return toast.success('Budget created!');
		} catch (e) {
			throw new Error('There was a problem creating your budget.');
		}
	}

	if (_action === 'createExpense') {
		try {
			createExpense({
				name: values.newExpense,
				amount: values.newExpenseAmount,
				budgetId: values.newExpenseBudget,
			});
			return toast.success(`Expense ${values.newExpense} created!`);
		} catch (e) {
			throw new Error('There was a problem creating your expense.');
		}
	}

	if (_action === 'deleteExpense') {
		try {
			deleteItem({
				key: 'expenses',
				id: values.expenseId,
			});
			return toast.success('Expense deleted!');
		} catch (e) {
			throw new Error('There was a problem deleting your expense.');
		}
	}
}

export function Dashboard() {
	const { userName, budgets, expenses } = useLoaderData();
	const [modalOpen, setModalOpen] = useState(false);
	const [income, setIncome] = useState(localStorage.getItem('income') || 0);
	const [showBudgetForm, setShowBudgetForm] = useState(false);
	const [showExpenseForm, setShowExpenseForm] = useState(false);
	const incomeRef = useRef(null);
	let totalBudgets = getTotalBudgets();
	let totalExpenses = getTotalExpenses();
	let availableBudget = income - totalExpenses;

	useEffect(() => {
		totalExpenses = getTotalExpenses();
		availableBudget = income - totalExpenses;
		if (availableBudget < 0) {
			toast.error(`You are over budget by $ ${Math.abs(availableBudget)}`);
		}
	}, [expenses, budgets, income]);

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

	function saveIncome() {
		setIncome(incomeRef.current.value);
		localStorage.setItem('income', incomeRef.current.value);
		toast.success(`${incomeRef.current.value} saved as income !`);
		closeModal();
	}

	return (
		<>
			{userName ? (
				<div className='px-0 mx-auto overflow-x-hidden max-w-[1200px]'>
					<div className='flex flex-wrap justify-center sm:justify-between items-center py-4'>
						{/* header */}
						<h1 className='text-3xl sm:text-5xl text-alice font-jetBrain py-6'>
							{userName != 'rimane' || userName != 'riri' ? (
								<span>
									{' '}
									Welcome back, <span className='text-fluo capitalize'>{userName}</span>{' '}
								</span>
							) : (
								<span>
									Welcome back baby, <span className='text-fluo'> je taymk </span>{' '}
								</span>
							)}

							<br />
							<span className='text-lg mt-2'>
								You have <span className='text-fluo'>$ {availableBudget} </span> left to spend this
								month.
								<br />
								Spent <span className='text-tomato'>$ {totalExpenses} </span> so far out of{' '}
								<span className='text-sunny'> $ {totalBudgets} </span> budgeted.
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
													Salary or other types of income
												</Dialog.Title>
												<div className='grid mt-4 gap-4'>
													<label className='sr-only' htmlFor='newBudgetAmount'>
														Salary
													</label>
													<input
														className='text-navy border-navy ring-2 ring-navy outline-navy rounded-lg py-2 px-4'
														type='number'
														name='income'
														id='income'
														placeholder='... $12000'
														required
														inputMode='decimal'
														ref={incomeRef}
													/>
												</div>

												<div className='mt-6'>
													<button
														onKeyDown={saveIncome}
														onClick={saveIncome}
														type='button'
														className='inline-flex justify-center rounded-md border border-transparent bg-alice px-4 py-2 text-sm font-medium text-navy hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2'>
														Add income
													</button>
												</div>
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
												<AddBudgetForm />
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
												<AddExpenseForm budgets={budgets} />
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
