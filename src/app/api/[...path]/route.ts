import { NextRequest } from 'next/server';

import { forward } from '@/shared/api/server';

// Next 16 passes a route context as the 2nd arg, which collides with forward()'s `override` param.
const handler = (req: NextRequest) => forward(req);

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
