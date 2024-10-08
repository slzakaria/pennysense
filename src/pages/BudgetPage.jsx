import { useLoaderData } from 'react-router-dom';
import { AddExpenseForm } from '../components/AddExpenseForm';
import { BudgetItem } from '../components/BudgetItem';
import { Table } from '../components/Table';
import { createExpense, deleteItem, getAllMatchingItems } from '../helpers';
import { toast } from 'react-toastify';

export async function budgetLoader({ params }) {
	const budget = await getAllMatchingItems({
		category: 'budgets',
		key: 'id',
		value: params.id,
	})[0];

	const expenses = await getAllMatchingItems({
		category: 'expenses',
		key: 'budgetId',
		value: params.id,
	});

	if (!budget) {
		throw new Error('The budget you’re trying to find doesn’t exist');
	}

	return { budget, expenses };
}

export async function budgetAction({ request }) {
	const data = await request.formData();
	const { _action, ...values } = Object.fromEntries(data);

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

export function BudgetPage() {
	const { budget, expenses } = useLoaderData();

	return (
		<div className='grid gap-8 px-8 pt-8 mx-auto'>
			<h1 className='text-alice text-lg'>
				<span className='text-fluo capitalize js-budgetName'>{budget.name}</span> Overview
			</h1>
			<div className='flex flex-wrap gap-6'>
				<BudgetItem budget={budget} showDelete={true} />
				<AddExpenseForm budgets={[budget]} />
			</div>
			{expenses && expenses.length > 0 && (
				<div className='grid gap-6'>
					<h2 className='text-alice text-lg'>
						<span className='text-fluo capitalize'>{budget.name}</span> Expenses
					</h2>
					<Table expenses={expenses} showBudget={false} />
				</div>
			)}
		</div>
	);
}
