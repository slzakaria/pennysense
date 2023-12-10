import { useRef } from "react";
import { Form } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { fetchData } from "../utils/helpers";
import { FaUserPlus } from "react-icons/fa6";
import { supabaseClient } from "../utils/supabase";
import ImageSlider from "../components/utility/ImageSlider";
import { UserForm } from "./UserForm";

const Intro = () => {
	const userName = fetchData("userName");

	const emailRef = useRef(null);
	const passWordRef = useRef(null);

	async function Signup(event) {
		event.preventDefault();
		console.log("Creating account with ", emailRef.current.value, passWordRef.current.value);

		const { data, error } = await supabaseClient.auth.signUp({
			email: emailRef.current.value,
			password: passWordRef.current.value,
		});

		console.log("Sign up data and error ===", data, error);
	}

	async function GoogleSignIn() {
		const { data, error } = await supabaseClient.auth.signInWithOAuth({
			provider: "github",
		});

		console.log("user, session, error ===", data, error);
	}

	async function getSession() {
		const {
			data: { user },
		} = await supabaseClient.auth.getUser();
		console.log("user ===", user);
	}

	return (
		<div className='mx-auto w-full px-1 py-2 sm:px-10 sm:4/5 sm:py-6'>
			<div className='mt-6 sm:mt-16 mx-auto gap-x-6 lg:flex lg:items-center'>
				<div className='w-full max-w-xl lg:shrink-0 xl:max-w-2xl'>
					<h1 className='text-center sm:text-start text-2xl font-bold tracking-tight text-alice sm:text-5xl font-jetBrain'>
						Control Your Finances, <br />
						<span className='text-fluo'>Penny Sense</span>.
					</h1>
					<p className='text-center sm:text-start relative mt-6 text-lg text-alice sm:max-w-md lg:max-w-none'>
						Budgeting Made <span className='text-fluo font-bold'>Simple</span> , Results Made{" "}
						<span className='text-fluo font-bold'>Significant</span>.
					</p>

					<p className='text-center sm:text-start relative mt-1 text-lg leading-8 text-alice sm:max-w-md lg:max-w-none'>
						Start free : <br className='block sm:hidden' />
						<TypeAnimation
							className='relative px-1 rounded-sm text-sm sm:text-lg text-navy font-bold bg-fluo font-jetBrain'
							sequence={[
								"Interactive Budget Visualization",
								1500,
								"Customizable Budget Goals",
								1500,
								"Easy Expense Entry",
								1500,
								"Interactive graphs for insights",
								1500,
							]}
							speed={40}
							wrapper='span'
							repeat={Infinity}
						/>
					</p>

					{/* cta */}
					{!userName ? (
						<div className='sm:mt-6 mt-4 w-4/5 mx-auto sm:mx-0'>
							{/* <Form className='sm:text-start text-center  grid grid-cols-1' method='post'>
								<input
									className='text-navy rounded-lg py-2 px-4'
									type='text'
									name='userName'
									required
									placeholder='Enter a username'
									aria-label='Your Name'
									autoComplete='given-name'
								/>
								<input type='hidden' name='_action' value='newUser' />
								<button
									className='text-center group shadow-md bg-fluo text-black py-1.5 px-6 rounded-md my-2 hover:bg-fluo/80 transition-all duration-300 flex justify-center gap-2 items-center'
									type='submit'>
									<span className='text-lg px-2'>Start budgeting</span>
									<span>
										<FaUserPlus
											className='group-transition-all group-duration-300 ml-2 text-black'
											aria-hidden='true'
										/>
									</span>
								</button>
							</Form> */}
							<UserForm />;
						</div>
					) : (
						<div className='my-10 inline-block w-4/5 mx-auto'>
							<button className='text-jetBrain text-fluo  hover:underline hover:bg-fluo hover:text-navy p-2 rounded-sm shadow-sm'>
								Go to account
							</button>
						</div>
					)}
				</div>

				{/* image tile */}
				<div className='w-4/5 mx-auto'>
					<ImageSlider />
				</div>
			</div>
		</div>
	);
};
export default Intro;
