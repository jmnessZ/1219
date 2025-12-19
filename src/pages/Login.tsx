import React, { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
    const {
        login,
        register,
        isAuthenticated
    } = useContext(AuthContext);

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [userType, setUserType] = useState<"student" | "teacher">("student");
    const navigate = useNavigate();

    if (isAuthenticated) {
        navigate("/");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isRegisterMode) {
            const success = await register(phone, username, password, userType);

            if (success) {
                toast.success("注册成功！欢迎加入摄影与舞台社");
                navigate("/");
            }
        } else {
            const success = await login(phone, password);

            if (success) {
                toast.success("登录成功！");
                navigate("/");
            } else {
                toast.error("手机号或密码错误，请重试");
            }
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="flex justify-center mb-6">
                        <div className="relative w-16 h-16 bg-orange-500 rounded-md overflow-hidden">
                            <div
                                className="absolute top-1 left-1 w-14 h-14 bg-white rounded-full overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 w-full h-full bg-orange-500 rounded-br-full"
                                    style={{
                                        backgroundColor: "#FED7AA",
                                        backgroundSize: "cover",
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "50% 50%"
                                    }}></div>
                                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                            <div className="absolute bottom-0 left-0 text-black font-bold text-xs p-0.5">S F S Y</div>
                        </div>
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        {isRegisterMode ? "创建账号" : "登录"}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isRegisterMode ? "加入摄影与舞台社，分享你的摄影作品" : "使用手机号登录你的账号"}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        {isRegisterMode && <>
                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 px-3">用户类型
                                                      </label>
                                <div className="flex px-3">
                                    <label className="inline-flex items-center mr-4">
                                        <input
                                            type="radio"
                                            name="userType"
                                            value="student"
                                            checked={userType === "student"}
                                            onChange={() => setUserType("student")}
                                            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300" />
                                        <span className="ml-2 text-sm text-gray-700">学生</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="userType"
                                            value="teacher"
                                            checked={userType === "teacher"}
                                            onChange={() => setUserType("teacher")}
                                            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300" />
                                        <span className="ml-2 text-sm text-gray-700">老师</span>
                                    </label>
                                </div>
                            </div>
                            {}
                            <div>
                                <label htmlFor="username" className="sr-only">用户名
                                                      </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    placeholder={userType === "student" ? "请输入班级+姓名（如：2025届1班张三）" : "请输入老师姓名"}
                                    value={username}
                                    onChange={e => setUsername(e.target.value)} />
                            </div>
                            {}
                            <div
                                className="px-3 py-2 bg-orange-50 text-xs text-orange-700 rounded-b-none border-x border-gray-300">
                                {userType === "student" ? "请使用\"2025届X班姓名\"格式，例如：2025届1班张三" : "请直接使用老师姓名，例如：李老师"}
                            </div>
                        </>}
                        <div>
                            <label htmlFor="phone" className="sr-only">手机号码
                                              </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                className={`relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${isRegisterMode ? "rounded-none" : "rounded-t-md"}`}
                                placeholder="请输入手机号码"
                                value={phone}
                                onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">密码
                                              </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                placeholder="请输入密码"
                                value={password}
                                onChange={e => setPassword(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200">
                            {isRegisterMode ? "注册" : "登录"}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button
                        type="button"
                        className="text-sm font-medium text-orange-500 hover:text-orange-600"
                        onClick={() => setIsRegisterMode(!isRegisterMode)}>
                        {isRegisterMode ? "已有账号？立即登录" : "还没有账号？立即注册"}
                    </button>
                </div>
                <></>
            </div>
        </div>
    );
};

export default Login;