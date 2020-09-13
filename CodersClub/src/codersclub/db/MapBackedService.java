package codersclub.db;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
Implementation based on a map. This might be used for real services at a small
scale; or more likely it will be a mock implementation for testing to be
swapped with a real JPA-based service.

@author Will Provost
*/
public class MapBackedService<T>
    implements CRUDService<T>
{
    /**
    Callback interface to allow client code to plug in the specifics
    of where the primary key lives in the value class.
    */
    public static interface IDHelper<T>
    {
        public int getID (T object);
        public void setID (T object, int ID);
    }
    
    private Map<Integer,T> map;
    private IDHelper<T> helper;
    private int maxID = Integer.MIN_VALUE;

    /**
    Provide the map that this service will use as its data source.
    We also need a callback function to help us find an object's ID;
    a JPA provider knows how to do this based on entity metadata,
    but we're not that smart!
    */ 
    public MapBackedService (Map<Integer,T> map, IDHelper<T> finder)
    {
        this.map = map;
        this.helper = finder;
        
        for (int key : map.keySet ())
            if (maxID < key)
                maxID = key;
    }
    
    /**
    Helper method to find an unused key for "generation."
    */
    private int generateKey ()
    {
        return ++maxID;
    }
    
    /**
    Return the number of entries in the map.
    */
    public long getCount ()
    {
        return map.size ();
    }

    /**
    Populate a list with all the values.
    */
    public List<T> getAll ()
    {
        List<T> result = new ArrayList<T> ();
        result.addAll (map.values ());
        return result;
    }

    /**
    Return the value at the given key, or 
    */
    public T getByID (int ID)
    {
        return map.get (ID);
    }

    /**
    Adds the value at a {@link #generateKey "generated"} key.
    */
    public T add (T newObject)
    {
        int ID = generateKey ();
        map.put (ID, newObject);
        helper.setID (newObject, ID);
        return newObject;
    }

    /**
    Use the registered callback to find the object's ID, and then
    update the corresponding value in the map.
    */
    public T update (T modifiedObject)
    {
        int ID = helper.getID (modifiedObject);
        if (!map.containsKey (ID))
            throw new IllegalArgumentException ("No object with ID: " + ID);
        
        map.put (ID, modifiedObject);
        return modifiedObject;
    }

    /**

    */
    public void remove (T oldObject)
    {
        int ID = helper.getID (oldObject);
        if (!map.containsKey (ID))
            throw new IllegalArgumentException ("No object with ID: " + ID);
        
        map.remove (ID);
    }

    /**

    */
    public void removeByID (int ID)
    {
        if (!map.containsKey (ID))
            throw new IllegalArgumentException ("No object with ID: " + ID);

        map.remove (ID);
    }
}
