import { RequestHandler } from "express";
import User from "../../models/fbUser";

const userFilter = { __v: 0 };

export const login: RequestHandler = async (req, res, next) => {
  try {
    const loginDTO = {
      email: req.body.email,
      name: req.body.name,
      id: req.body.id,
    };
    const isExist = await User.findOne({ id: loginDTO.id }); //fbUser임..
    if (isExist == null) {
      // 존재하지 않음.
      console.log("없는 아이디에 대한 요청");
      return res.status(404).json({ msg: "Not Authorized", error: true });
    } else {
      console.log("TEST login Success!!!");
      console.log(`VALUE: ${loginDTO.id}`);
      const fbUser = await User.findOne({ id: "123123" })
        .select(userFilter)
        .exec();
      return res.status(200).json({ msg: "OK", error: false, user: fbUser });
    }
  } catch (error) {
    console.error("login Error");
    console.error(error);
    return res.status(500).json({ msg: "Internal Error", error: true });
  }
};

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await User.find().select(userFilter);
    return res.status(200).json({ msg: "성공", error: false, users: users });
  } catch (error) {
    console.error("getUsers Error");
    console.error(error);
    return res.status(500).json({ msg: "Internal Error", error: true });
  }
};
