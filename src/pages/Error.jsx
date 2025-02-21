import { useRouteError, Link, useNavigate } from 'react-router-dom';

export function Error() {
	const error = useRouteError();
	const navigate = useNavigate();
	console.log('ERROR PAGE CAUSED BY ======>', error.error);

	return (
		<div className='error h-screen'>
			<h1 className='text-alice text-xl'>Uh oh! Sorry We’ve got a problem.</h1>
			<p className='text-tomato'>{error?.message || error?.statusText}</p>
			<div className='flex gap-6'>
				<button className='' onClick={() => navigate(-1)}>
					<span className='bg-tomato text-alice px-4 py-1 rounded-lg text-lg'>Go Back</span>
				</button>
				<Link to='/' className=''>
					<span className='bg-alice text-navy px-4 py-1 rounded-lg text-lg'>Go home</span>
				</Link>
			</div>
		</div>
	);
}
