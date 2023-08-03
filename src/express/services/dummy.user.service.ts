import DummyUser from "../schemas/dummy.user.schema";

export const addDummyCustomer = async (id: string, geo: any) => {
  try {
    const result = await DummyUser.findOneAndUpdate(
      { browserId: id },
      { location: geo },
      { upsert: true, new: true, runValidators: true }
    );
    return result;
  } catch (err) {
    return { err: err };
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
    const result = await DummyUser.findOne({ browserId: id });
    return result;
  } catch (err) {
    return { err: err };
  }
};

export const update_dummy_user = async (body: any, browserId: string) => {
  try {
    const result = await DummyUser.findOneAndUpdate(
      { browserId: browserId },
      { generalInfo: body },
      { upsert: true, new: true, runValidators: true }
    );
    return result;
  } catch (err) {
    return { err: err };
  }
};
