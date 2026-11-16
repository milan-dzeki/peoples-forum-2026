
import { startSession, type ClientSession } from 'mongoose';

const withTransaction = async <T>(
  callback: (session: ClientSession) => Promise<T>
): Promise<T> => {
  const session = await startSession();

  try {
    session.startTransaction();

    const result = await callback(session);

    await session.commitTransaction();

    return result;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export default withTransaction;
