"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the terms & conditions.");
      return;
    }

    setLoading(true);
    const result = await register(form);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
      {/* Background shapes */}
      <div className="_shape_one">
        <img src="/assets/images/shape1.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src="/assets/images/shape2.svg" alt="" className="_shape_img" />
        <img
          src="/assets/images/dark_shape1.svg"
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className="_shape_three">
        <img src="/assets/images/shape3.svg" alt="" className="_shape_img" />
        <img
          src="/assets/images/dark_shape2.svg"
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>

      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            {/* Left image */}
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <img src="/assets/images/registration.png" alt="Image" />
                </div>
                <div className="_social_registration_right_image_dark">
                  <img src="/assets/images/registration1.png" alt="Image" />
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                {/* Logo */}
                <div className="_social_registration_right_logo _mar_b28">
                  <img
                    src="/assets/images/logo.svg"
                    alt="Image"
                    className="_right_logo"
                  />
                </div>

                <p className="_social_registration_content_para _mar_b8">
                  Get Started Now
                </p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">
                  Registration
                </h4>

                {/* Google button (design only) */}
                <button
                  type="button"
                  className="_social_registration_content_btn _mar_b40"
                >
                  <img
                    src="/assets/images/google.svg"
                    alt="Image"
                    className="_google_img"
                  />
                  <span>Register with google</span>
                </button>

                <div className="_social_registration_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                {/* Error message */}
                {error && (
                  <div
                    className="alert alert-danger py-2 mb-3"
                    role="alert"
                    style={{ fontSize: "14px" }}
                  >
                    {error}
                  </div>
                )}

                <form
                  className="_social_registration_form"
                  onSubmit={handleSubmit}
                >
                  <div className="row">
                    {/* First Name & Last Name — required by task, added to the form */}
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          className="form-control _social_registration_input"
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="First name"
                          required
                          autoComplete="given-name"
                        />
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          className="form-control _social_registration_input"
                          value={form.lastName}
                          onChange={handleChange}
                          placeholder="Last name"
                          required
                          autoComplete="family-name"
                        />
                      </div>
                    </div>

                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="form-control _social_registration_input"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          className="form-control _social_registration_input"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                          required
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">
                          Repeat Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-control _social_registration_input"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repeat your password"
                          required
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                      <div className="form-check _social_registration_form_check">
                        <input
                          className="form-check-input _social_registration_form_check_input"
                          type="checkbox"
                          id="termsCheck"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <label
                          className="form-check-label _social_registration_form_check_label"
                          htmlFor="termsCheck"
                        >
                          I agree to terms &amp; conditions
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                        <button
                          type="submit"
                          className="_social_registration_form_btn_link _btn1"
                          disabled={loading}
                        >
                          {loading ? "Creating account..." : "Register now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account?{" "}
                        <Link href="/login">Login</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
