import DummyUser from "../schemas/dummy.user.schema";

export const addDummyCustomer = async (id: string, data: any) => {
  try {
    if (!id) {
      const result = await DummyUser.create({
        ...data,
      });
      return { status: "success", result: result };
    }
    const result = await DummyUser.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          generalInfo: data?.generalInfo,
          firstName: data?.firstName,
          lastName: data?.lastName,
          email: data?.email,
          phoneNumber: data?.phoneNumber,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const checkDummy = async (id: string) => {
  try {
    const result = await DummyUser.findOneAndDelete({ browserId: id });
    return result;
  } catch (err) {
    return { err: err };
  }
};

export const getDummyCustomer = async (id: string) => {
  try {
    const result = await DummyUser.findOne({ _id: id }, { password: 0 });
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const update_dummy_user = async (body: any, id: string) => {
  try {
    const result = await DummyUser.findOneAndUpdate(
      { _id: id },
      { ...body },
      { new: true }
    );
    return result;
  } catch (err) {
    return { err: err };
  }
};

export const getAllDummyUsersCount = async () => {
  try {
    const result = await DummyUser.countDocuments();
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};
