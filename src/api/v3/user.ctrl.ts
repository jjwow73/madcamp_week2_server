import { RequestHandler } from "express";
import { checkHashPassword, saltHashPassword } from "../../lib/passwordManager";
import User from "../../models/user";

const userFilter = { __v: 0 };

export const register: RequestHandler = async (req, res, next) => {
  try {
    console.log(`register start`);
    const dto = req.body;
    const plainPassword = dto.password;
    const hashData = saltHashPassword(plainPassword);

    // get 3 변수 from 사용자
    const password = hashData.passwordHash;
    const salt = hashData.salt;

    const name = dto.name;
    const email = dto.email;

    // 페이스북 로그인이 아님
    const facebook = 0;

    const insertJson = {
      email: email,
      password: password,
      salt: salt,
      name: name,
      facebook: facebook,
      phone: req.body.phone,
    };

    const oldUser = await User.findOne({ email: email })
      .select(userFilter)
      .exec();

    if (oldUser == null) {
      const newUser = new User(insertJson);
      const result = await newUser.save();

      console.log("Registraction success");
      return res.status(200).json({
        msg: "Registraction success",
        user: result,
      });
    } else {
      console.log("이미 존재하는 이메일");

      return res.status(400).json({ msg: "Email already exists" });
    }
  } catch (error) {
    console.error("register Error");
    console.error(error);
    return res.status(500).json({ msg: "Internal Error", error: true });
  }
};

// user req에서 email과 password를 받음
// email을 통해 db에서 salt를 가져와 비밀번호 대칭을 해봄
export const login: RequestHandler = async (req, res, next) => {
  try {
    console.log(`login start`);
    const dto = {
      email: req.body.email,
      password: req.body.password,
    };

    const user = await User.findOne({ email: dto.email })
      .select(userFilter)
      .exec();

    // 이메일이 존재하지 않는 경우
    if (user == null) {
      console.log("Email Not Exist");
      return res.status(400).json({ msg: "Email Not Exist" });
    } else {
      // 해당하는 email이 존재하는 경우
      // salt값을 통한 패스워드 비교
      const salt = user.salt;
      const hashedPassword = checkHashPassword(dto.password, salt).passwordHash;
      const encryptedPassword = user.password;
      if (encryptedPassword === hashedPassword) {
        console.log(`Login Success`);
        return res.status(200).json({
          msg: "Login Success",
          user,
        });
      } else {
        console.log("Wrong password");
        return res.status(400).json({ msg: "Wrong password" });
      }
    }
  } catch (error) {
    console.error("login Error");
    console.error(error);
    return res.status(500).json({ msg: "Internal Error" });
  }
};

export const facebookLogin: RequestHandler = async (req, res, next) => {
  try {
    console.log(`facebookLogin start`);
    const dto = {
      // facebook AppID 꼭 받아야함.
      // 그러면 User에서도 추가해주기
      email: req.body.email,
      name: req.body.name,
      id: req.body.id,
    };

    const facebook = 1;

    const newUser = new User({
      email: dto.email,
      password: "0",
      salt: "0",
      name: dto.name,
      facebook: facebook,
      id: dto.id,
    });

    const user = await User.findOne({ email: dto.email })
      .select(userFilter)
      .exec();
    if (user == null) {
      newUser.save((err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ msg: "Facebook Registration failure" });
        } else {
          return res.status(200).json({
            msg: "Facebook Registration success",
            user,
          });
        }
      });
    } else {
      return res.status(200).json({
        msg: "Facebook Registration success",
        user,
      });
    }
  } catch (error) {
    console.error("facebookLogin Error");
    console.error(error);
    return res.status(500).json({ msg: "Internal Error" });
  }
};

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await User.find().sort('name').select(userFilter);
		console.log(users);
    return res.status(200).json({ msg: "성공", error: false, users: users });
  } catch (error) {
    console.error("getUsers Error");
    console.error(error);
    return res.status(500).json({ msg: "Internal Error", error: true });
  }
};
