import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link, Form } from 'react-router-dom';
import { EditBudget } from './EditBudget';
import { FaRegTrashCan, FaPen, FaMoneyCheckDollar } from 'react-icons/fa6';
import { formatCurrency, formatPercentage, calculateSpentByBudget } from '../helpers';

export function BudgetItem({ budget, showDelete = false }) {
	if (!budget || !budget.id) {
		return null;
	}

	const { id, name, amount } = budget;
	const [spent, setSpent] = useState(0);
	const [showBudgetForm, setShowBudgetForm] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const getSpentAmount = async () => {
			if (!id) return;
			const spentAmount = await calculateSpentByBudget(id);
			if (isMounted) {
				setSpent(spentAmount);
			}
		};

		getSpentAmount();

		return () => {
			isMounted = false;
		};
	}, [id]);

	function toggleBudgetForm() {
		setShowBudgetForm(!showBudgetForm);
	}

	return (
		<>
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
									<EditBudget budgetItem={budget} />
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
			<div className='budget mt-6 grid auto-cols-fr gap-6 border-fluo rounded-2xl p-4 border-2 text-alice'>
				<div className='progress-text'>
					<h3>{name}</h3>
					<p>{formatCurrency(amount)} Budgeted</p>
				</div>

				<progress max={amount} value={spent}>
					{formatPercentage(spent / amount)}
				</progress>
				<div className='progress-text'>
					<small>{formatCurrency(spent)} spent</small>
					<small className={`${amount - spent < 0 ? 'text-tomato' : 'text-alice'}`}>
						{formatCurrency(amount - spent)} remaining
					</small>
				</div>
				{showDelete ? (
					<div className='flex flex-wrap gap-4'>
						<Form
							method='post'
							action='delete'
							onSubmit={(event) => {
								if (!confirm('Are you sure you want to permanently delete this budget?')) {
									event.preventDefault();
								}
							}}>
							<button
								type='submit'
								className='px-6 py-1 flex gap-2 bg-alice items-center rounded-md hover:bg-tomato transition-all duration-300 max-w-[230px]'>
								<span className='text-md text-navy'>Delete Budget</span>
								<FaRegTrashCan className='w-5 h-5 text-navy' />
							</button>
						</Form>
						<div>
							<button
								onClick={toggleBudgetForm}
								type='button'
								className='px-6 py-1 flex gap-2 bg-alice items-center rounded-md hover:bg-sunny transition-all duration-300 max-w-[230px]'>
								<span className='text-md text-navy'>Edit Budget</span>
								<FaPen className='w-4 h-4 text-navy' />
							</button>
						</div>
					</div>
				) : (
					<div className='flex flex-wrap gap-4'>
						<Link
							to={`/budget/${id}`}
							className='px-6 py-1 flex gap-2 bg-alice items-center rounded-md hover:bg-fluo transition-all duration-300 max-w-[230px]'>
							<span className='text-lg text-navy'>View Details</span>
							<FaMoneyCheckDollar className='w-5 h-5 text-navy' />
						</Link>
					</div>
				)}
			</div>
		</>
	);
}
