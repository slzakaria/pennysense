'use client';

import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { FaRegUser } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { getDate } from '../../helpers';
import * as ExcelJS from 'exceljs';
import supabase from '../../services/supabase';

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

async function logout() {
	const { error } = await supabase.auth.signOut();
	if (error) {
		toast.error('Error signing out');
		return;
	}
	toast.success('Signed out successfully');
	window.location.replace('/login');
}

async function resetData() {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return;

	try {
		// Delete all user data
		await Promise.all([
			supabase.from('budgets').delete().eq('user_id', user.id),
			supabase.from('expenses').delete().eq('user_id', user.id),
			supabase.from('user_settings').delete().eq('user_id', user.id),
		]);

		toast.success('Data has been reset!');
		window.location.reload();
	} catch (error) {
		toast.error('Failed to reset data');
	}
}

async function downloadDataAsJson() {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		toast.error('Please sign in to export data');
		return;
	}

	const { data: budgets } = await supabase.from('budgets').select('*').eq('user_id', user.id);

	const { data: expenses } = await supabase.from('expenses').select('*').eq('user_id', user.id);

	const { data: settings } = await supabase
		.from('user_settings')
		.select('*')
		.eq('user_id', user.id)
		.single();

	const exportData = {
		budgets,
		expenses,
		settings,
	};

	const blob = new Blob([JSON.stringify(exportData, null, 2)], {
		type: 'application/json',
	});

	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `pennysense-export-${new Date().toISOString()}.json`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function downloadDataAsExcel() {
	const username = JSON.parse(localStorage.getItem('userName'));
	const income = JSON.parse(localStorage.getItem('income'));
	const budgets = JSON.parse(localStorage.getItem('budgets'));
	const expenses = JSON.parse(localStorage.getItem('expenses'));

	if (!username || !income || !budgets || !expenses) {
		console.error('Incomplete data in local storage. Cannot download Excel file.');
		toast.error('Incomplete data in local storage. Cannot download Excel file.');
		return;
	}

	const chartData = [
		['Type', 'Amount'],
		['Budget', budgets.reduce((sum, budget) => sum + budget.amount, 0)],
		['Expense', expenses.reduce((sum, expense) => sum + expense.amount, 0)],
	];

	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(`${username} - ${getDate()}`);

	const data = [
		['User', 'Type', 'Date', 'Name', 'Category', 'Amount'],
		...budgets.map((budget) => [
			username,
			'Budget',
			budget.createdAt,
			budget.name,
			budget.name,
			budget.amount,
		]),
		...expenses.map((expense) => [
			username,
			'Expense',
			expense.createdAt,
			expense.name,
			expense.budgetName,
			expense.amount,
		]),
	];

	worksheet.addRows(data);

	budgets.forEach((budget, index) => {
		const row = worksheet.getRow(index + 2);
		row.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: '00FF00' },
		};
	});

	expenses.forEach((expense, index) => {
		const row = worksheet.getRow(index + 2 + budgets.length);
		row.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FF6347' },
		};
	});

	workbook.xlsx.writeBuffer().then((buffer) => {
		const blob = new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		});

		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(blob);
		downloadLink.download = 'data.xlsx';

		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	});

	localStorage.setItem('chartData', JSON.stringify(chartData));
}

function makeChart() {
	const username = JSON.parse(localStorage.getItem('userName'));
	const income = JSON.parse(localStorage.getItem('income'));
	const budgets = JSON.parse(localStorage.getItem('budgets'));
	const expenses = JSON.parse(localStorage.getItem('expenses'));

	if (!username || !income || !budgets || !expenses) {
		console.error('Incomplete data in local storage.');
		toast.error('Incomplete data (Income, budgets, expenses), cannot make charts yet.');
		return;
	}

	const chartData = [
		['Type', 'Amount'],
		['Budget', budgets.reduce((sum, budget) => sum + budget.amount, 0)],
		['Expense', expenses.reduce((sum, expense) => sum + expense.amount, 0)],
	];

	localStorage.setItem('chartData', JSON.stringify(chartData));
	window.location.replace('/stats');
}

export function DropMenu() {
	const navigate = useNavigate();
	return (
		<Menu as='div' className='relative inline-flex text-left'>
			<div>
				<Menu.Button className='uppercase flex items-center justify-center rounded-md bg-alice gap-2 px-3 py-2 text-sm font-semibold text-navy shadow-sm ring-1 ring-inset ring-navy hover:bg-gray-100'>
					Account
					<FaRegUser className='h-3 w-3 text-navy' aria-hidden='true' />
				</Menu.Button>
			</div>

			<Transition
				as={Fragment}
				enter='transition ease-out duration-100'
				enterFrom='transform opacity-0 scale-95'
				enterTo='transform opacity-100 scale-100'
				leave='transition ease-in duration-75'
				leaveFrom='transform opacity-100 scale-100'
				leaveTo='transform opacity-0 scale-95'>
				<Menu.Items className='absolute right-0 z-10 mt-10 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
					<div className='py-1'>
						<Menu.Item>
							{({ active }) => (
								<button
									type='button'
									onClick={navigate.bind(null, '/import')}
									className={classNames(
										active ? 'bg-gray-100 text-navy' : 'text-gray-700',
										'block px-4 py-2 text-sm w-full'
									)}>
									Import JSON Data
								</button>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<button
									type='button'
									onClick={downloadDataAsJson}
									className={classNames(
										active ? 'bg-gray-100 text-navy' : 'text-gray-700',
										'block px-4 py-2 text-sm w-full'
									)}>
									Download Data as JSON
								</button>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<button
									type='button'
									onClick={downloadDataAsExcel}
									className={classNames(
										active ? 'bg-gray-100 text-navy' : 'text-gray-700',
										'block px-4 py-2 text-sm w-full'
									)}>
									Download Data as excel
								</button>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<button
									type='button'
									onClick={makeChart}
									className={classNames(
										active ? 'bg-gray-100 text-navy' : 'text-gray-700',
										'block px-4 py-2 text-sm w-full'
									)}>
									Visualize Data
								</button>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<button
									type='button'
									onClick={resetData}
									className={classNames(
										active ? 'bg-gray-100 text-navy' : 'text-gray-700',
										'block px-4 py-2 text-sm w-full'
									)}>
									Reset Data
								</button>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<button
									type='button'
									onClick={logout}
									className={classNames(
										active ? 'bg-gray-100 text-navy' : 'text-gray-700',
										'block w-full px-4 py-2  text-sm'
									)}>
									Sign out
								</button>
							)}
						</Menu.Item>
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	);
}
