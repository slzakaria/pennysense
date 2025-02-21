import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';
import { formatCurrency, getAllMatchingItems, formatDate } from '../helpers';
import React from 'react';

export function ExpenseItem({ expense, showBudget, onDelete }) {
	const [budget, setBudget] = useState(null);

	useEffect(() => {
		const fetchBudget = async () => {
			if (expense.budget_id) {
				const budgets = await getAllMatchingItems({
					category: 'budgets',
					key: 'id',
					value: expense.budget_id,
				});
				setBudget(budgets[0]);
			}
		};

		fetchBudget();
	}, [expense.budget_id]);

	if (!expense || !expense.id) {
		return <td className='text-tomato'>Expense not found</td>;
	}

	if (!expense.budget_id) {
		return <td className='text-tomato'>Budget ID not found for this expense</td>;
	}

	return (
		<>
			<td className='text-navy text-xs sm:text-base text-center'>{expense.name}</td>
			<td className='text-center text-sm sm:text-base text-tomato'>
				{formatCurrency(expense.amount)}
			</td>
			<td className='text-navy text-xs sm:text-base text-center'>
				{formatDate(expense.created_at)}
			</td>
			{showBudget && budget && (
				<td className='text-navy text-sm sm:text-base text-center'>
					<Link to={`/budget/${budget.id}`}>{budget.name}</Link>
				</td>
			)}
			<td>
				<button
					onClick={() => onDelete(expense.id)}
					className='text-center btn btn--warning'
					aria-label={`Delete ${expense.name} expense`}>
					<FiXCircle className='text-tomato' width={20} />
				</button>
			</td>
		</>
	);
}
